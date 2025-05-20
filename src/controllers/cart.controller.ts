import { Request, Response, NextFunction } from 'express';
import { Cart, ICartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Get user's cart
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price offerPrice images stock');

    if (!cart) {
      logger.info('Cart not found for user', { userId: req.user._id });
      res.status(200).json({
        status: 'success',
        data: {
          cart: {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        },
      });
      return;
    }

    logger.info('Cart retrieved', { userId: req.user._id, itemCount: cart.items.length });
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity, lensType, lensColor, power } = req.body;

    // Check if product exists and is active
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      throw new AppError('Product not found or inactive', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
      logger.info('New cart created', { userId: req.user._id });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock again
      if (product.stock < newQuantity) {
        throw new AppError('Insufficient stock', 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.offerPrice || product.price;
      cart.items[existingItemIndex].lensType = lensType;
      cart.items[existingItemIndex].lensColor = lensColor;
      cart.items[existingItemIndex].power = power;

      logger.info('Cart item updated', { 
        userId: req.user._id,
        productId,
        newQuantity
      });
    } else {
      // Create new cart item using the schema
      const newItem = {
        _id: new mongoose.Types.ObjectId(),
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        price: product.offerPrice || product.price,
        lensType,
        lensColor,
        power,
      };

      cart.items.push(newItem as ICartItem);

      logger.info('New item added to cart', { 
        userId: req.user._id,
        productId,
        quantity
      });
    }

    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price offerPrice images stock');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { quantity, lensType, lensColor, power } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    // Get product to check stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check stock if quantity is being updated
    if (quantity && product.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Update item
    if (quantity) cart.items[itemIndex].quantity = quantity;
    if (lensType) cart.items[itemIndex].lensType = lensType;
    if (lensColor) cart.items[itemIndex].lensColor = lensColor;
    if (power) cart.items[itemIndex].power = power;

    await cart.save();

    logger.info('Cart item updated', { 
      userId: req.user._id,
      itemId,
      updates: { quantity, lensType, lensColor, power }
    });

    // Populate product details
    await cart.populate('items.product', 'name price offerPrice images stock');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      throw new AppError('Item not found in cart', 404);
    }

    await cart.save();

    logger.info('Item removed from cart', { 
      userId: req.user._id,
      itemId
    });

    // Populate product details
    await cart.populate('items.product', 'name price offerPrice images stock');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemCount = cart.items.length;
    cart.items = [];
    await cart.save();

    logger.info('Cart cleared', { 
      userId: req.user._id,
      itemCount
    });

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Validate cart items
export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price offerPrice stock isActive');

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const validationResults = {
      isValid: true,
      errors: [] as string[],
      updatedItems: [] as ICartItem[],
    };

    // Validate each item
    for (const item of cart.items) {
      const product = item.product as any;

      // Check if product exists and is active
      if (!product || !product.isActive) {
        validationResults.isValid = false;
        validationResults.errors.push(
          `Product "${product?.name || 'Unknown'}" is no longer available`
        );
        continue;
      }

      // Check stock
      if (product.stock < item.quantity) {
        validationResults.isValid = false;
        validationResults.errors.push(
          `Insufficient stock for "${product.name}"`
        );
        continue;
      }

      // Check price changes
      const currentPrice = product.offerPrice || product.price;
      if (currentPrice !== item.price) {
        item.price = currentPrice;
        validationResults.updatedItems.push(item);
      }
    }

    // Update cart if there are price changes
    if (validationResults.updatedItems.length > 0) {
      await cart.save();
      logger.info('Cart prices updated', { 
        userId: req.user._id,
        updatedItems: validationResults.updatedItems.length
      });
    }

    logger.info('Cart validation completed', { 
      userId: req.user._id,
      isValid: validationResults.isValid,
      errorCount: validationResults.errors.length,
      updatedItemsCount: validationResults.updatedItems.length
    });

    res.status(200).json({
      status: 'success',
      data: validationResults,
    });
  } catch (error) {
    next(error);
  }
}; 