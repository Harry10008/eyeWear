import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  async createCart(userId: string) {
    logger.info('Creating new cart', { userId });
    const cart = await this.cartRepository.create({
      user: new mongoose.Types.ObjectId(userId),
      items: [],
      totalItems: 0,
      totalAmount: 0
    });
    logger.info('Cart created successfully', { cartId: cart._id });
    return cart;
  }

  async getCart(userId: string) {
    let cart = await this.cartRepository.findByUser(userId);
    
    if (!cart) {
      cart = await this.createCart(userId);
    }
    
    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    
    // Check if product already exists in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        price: 0 // Will be updated when saving
      } as any);
    }

    // Update total
    await this.updateCartTotal(cart);
    
    return await cart.save();
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    
    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      throw new AppError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    // Update total
    await this.updateCartTotal(cart);
    
    return await cart.save();
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    // Update total
    await this.updateCartTotal(cart);
    
    return await cart.save();
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    
    return await cart.save();
  }

  private async updateCartTotal(cart: any) {
    let totalItems = 0;
    let totalAmount = 0;
    
    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.product.toString());
      if (product) {
        const price = product.offerPrice || product.price;
        item.price = price;
        totalItems += item.quantity;
        totalAmount += price * item.quantity;
      }
    }
    
    cart.totalItems = totalItems;
    cart.totalAmount = totalAmount;
  }
} 