import { Request, Response } from 'express';
import { Cart, ICartItem } from '../models/cart.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { CartService } from '../services/cart.service';
import { catchAsync } from '../utils/catchAsync';

const cartService = new CartService();

// Get user's cart
export const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  const cart = await cartService.getCart(userId);
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Add item to cart
export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(userId, productId, quantity);
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Update cart item
export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateCartItem(userId, productId, quantity);
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Remove item from cart
export const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  const { productId } = req.params;
  const cart = await cartService.removeFromCart(userId, productId);
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Clear cart
export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  const cart = await cartService.clearCart(userId);
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Validate cart items
export const validateCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  
  const cart = await Cart.findOne({ user: userId })
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
      userId,
      updatedItems: validationResults.updatedItems.length
    });
  }

  logger.info('Cart validation completed', { 
    userId,
    isValid: validationResults.isValid,
    errorCount: validationResults.errors.length,
    updatedItemsCount: validationResults.updatedItems.length
  });

  res.status(200).json({
    status: 'success',
    data: validationResults,
  });
}); 