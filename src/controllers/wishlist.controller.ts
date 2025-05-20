import { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../models/wishlist.model';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Get user's wishlist
export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products',
        select: 'name description price offerPrice images brand category',
      });

    if (!wishlist) {
      logger.info('Wishlist not found for user', { userId: req.user._id });
      res.status(200).json({
        status: 'success',
        data: {
          wishlist: {
            products: [],
            productCount: 0,
          },
        },
      });
      return;
    }

    logger.info('Wishlist retrieved', { 
      userId: req.user._id,
      productCount: wishlist.products.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add product to wishlist
export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [new mongoose.Types.ObjectId(productId)],
      });
      logger.info('New wishlist created', { userId: req.user._id });
    } else {
      // Check if product is already in wishlist
      if (wishlist.products.some(id => id.toString() === productId)) {
        throw new AppError('Product already in wishlist', 400);
      }

      // Add product to wishlist
      wishlist.products.push(new mongoose.Types.ObjectId(productId));
      await wishlist.save();
      logger.info('Product added to wishlist', { 
        userId: req.user._id,
        productId
      });
    }

    // Populate product details
    await wishlist.populate({
      path: 'products',
      select: 'name description price offerPrice images brand category',
    });

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    // Check if product is in wishlist
    if (!wishlist.products.some(id => id.toString() === productId)) {
      throw new AppError('Product not in wishlist', 404);
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== productId
    );
    await wishlist.save();

    logger.info('Product removed from wishlist', { 
      userId: req.user._id,
      productId
    });

    // Populate remaining products
    await wishlist.populate({
      path: 'products',
      select: 'name description price offerPrice images brand category',
    });

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Clear wishlist
export const clearWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    const productCount = wishlist.products.length;
    wishlist.products = [];
    await wishlist.save();

    logger.info('Wishlist cleared', { 
      userId: req.user._id,
      productCount
    });

    res.status(200).json({
      status: 'success',
      data: {
        wishlist: {
          products: [],
          productCount: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist
export const checkWishlistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      logger.info('Wishlist not found for user', { userId: req.user._id });
      res.status(200).json({
        status: 'success',
        data: {
          inWishlist: false,
        },
      });
      return;
    }

    const inWishlist = wishlist.products.some(id => id.toString() === productId);

    logger.info('Wishlist item check', { 
      userId: req.user._id,
      productId,
      inWishlist
    });

    res.status(200).json({
      status: 'success',
      data: {
        inWishlist,
      },
    });
  } catch (error) {
    next(error);
  }
}; 