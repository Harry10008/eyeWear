import { Request, Response } from 'express';
import { Wishlist } from '../models/wishlist.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { catchAsync } from '../utils/catchAsync';

// Get user's wishlist
export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const wishlist = await Wishlist.findOne({ user: userId })
    .populate('products', 'name price offerPrice images');

  if (!wishlist) {
    logger.info('Wishlist not found for user', { userId });
    return res.status(200).json({
      status: 'success',
      data: {
        wishlist: {
          products: [],
          productCount: 0
        }
      }
    });
  }

  return res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

// Add product to wishlist
export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId]
    });
    logger.info('New wishlist created', { userId });
  } else {
    // Check if product already exists in wishlist
    if (wishlist.products.includes(productId)) {
      throw new AppError('Product already in wishlist', 400);
    }

    wishlist.products.push(productId);
    await wishlist.save();
  }

  logger.info('Product added to wishlist', {
    userId,
    productId
  });

  return res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

// Remove product from wishlist
export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  logger.info('Product removed from wishlist', {
    userId,
    productId
  });

  return res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

// Clear wishlist
export const clearWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    logger.info('Wishlist not found for user', { userId });
    return res.status(200).json({
      status: 'success',
      data: {
        wishlist: {
          products: [],
          productCount: 0
        }
      }
    });
  }

  wishlist.products = [];
  await wishlist.save();

  logger.info('Wishlist cleared', {
    userId
  });

  return res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

// Check if product is in wishlist
export const checkWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    logger.info('Wishlist not found for user', { userId });
    return res.status(200).json({
      status: 'success',
      data: {
        inWishlist: false
      }
    });
  }

  const inWishlist = wishlist.products.some(id => id.toString() === productId);

  logger.info('Wishlist item check', { 
    userId,
    productId,
    inWishlist
  });

  return res.status(200).json({
    status: 'success',
    data: {
      inWishlist
    }
  });
}); 