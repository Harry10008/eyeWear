import { Types } from 'mongoose';
import { Cart, ICartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ICart } from '../interfaces/cart.interface';

export class CartService {
  async getCart(userId: Types.ObjectId): Promise<ICart> {
    try {
      let cart = await Cart.findOne({ user: userId })
        .populate('items.product', 'name price images stock');

      if (!cart) {
        cart = await Cart.create({
          user: userId,
          items: [],
          total: 0
        });
      }

      return cart;
    } catch (error) {
      logger.error('Error getting cart:', error);
      throw new AppError('Failed to get cart', 500);
    }
  }

  async addToCart(userId: Types.ObjectId, item: ICartItem): Promise<ICart> {
    try {
      let cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        cart = await Cart.create({
          user: userId,
          items: [item],
          total: item.price * item.quantity
        });
        return cart;
      }

      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.product.toString() === item.product.toString()
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        cart.items.push(item);
      }

      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();

      return cart;
    } catch (error) {
      logger.error('Error adding item to cart:', error);
      throw new AppError('Failed to add item to cart', 500);
    }
  }

  async updateCartItem(userId: Types.ObjectId, itemId: string, quantity: number): Promise<ICart> {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === itemId
      );

      if (itemIndex === -1) {
        throw new AppError('Item not found in cart', 404);
      }

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();

      return cart;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw new AppError('Failed to update cart item', 500);
    }
  }

  async removeFromCart(userId: Types.ObjectId, itemId: string): Promise<ICart> {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      cart.items = cart.items.filter(
        (item) => item._id.toString() !== itemId
      );

      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();

      return cart;
    } catch (error) {
      logger.error('Error removing item from cart:', error);
      throw new AppError('Failed to remove item from cart', 500);
    }
  }

  async clearCart(userId: Types.ObjectId): Promise<ICart> {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      cart.items = [];
      cart.total = 0;
      await cart.save();

      return cart;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw new AppError('Failed to clear cart', 500);
    }
  }

  async validateProduct(productId: Types.ObjectId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (!product.isActive) {
        throw new AppError('Product is not available', 400);
      }

      return product;
    } catch (error) {
      logger.error('Error validating product:', error);
      throw error;
    }
  }
} 