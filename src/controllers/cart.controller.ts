import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { CartService } from '../services/cart.service';
import { Types } from 'mongoose';
import { ICartItem } from '../models/cart.model';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const cart = await this.cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const { productId, quantity, lensDetails, frameDetails } = req.body;

      if (!productId || !quantity) {
        throw new AppError('Product ID and quantity are required', 400);
      }

      // Create a new cart item using the Cart model's items array
      const cartItem = {
        _id: new Types.ObjectId(),
        product: new Types.ObjectId(productId),
        quantity,
        price: 0, // This will be updated when the product is populated
        lensDetails,
        frameDetails
      } as ICartItem;

      const cart = await this.cartService.addToCart(userId, cartItem);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        throw new AppError('Valid quantity is required', 400);
      }

      const cart = await this.cartService.updateCartItem(userId, itemId, quantity);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const { itemId } = req.params;

      const cart = await this.cartService.removeFromCart(userId, itemId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const cart = await this.cartService.clearCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  validateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const cart = await this.cartService.getCart(userId);
      
      // Validate cart items
      const validationResults = await Promise.all(
        cart.items.map(async (item) => {
          try {
            // Check if product exists and is in stock
            const product = await this.cartService.validateProduct(item.product);
            
            // Check if quantity is valid
            const isQuantityValid = item.quantity > 0 && (product.stock ?? 0) >= item.quantity;
            
            return {
              productId: item.product.toString(),
              isValid: isQuantityValid,
              message: isQuantityValid ? 'Valid' : 'Invalid quantity'
            };
          } catch (error) {
            return {
              productId: item.product.toString(),
              isValid: false,
              message: 'Product not found or out of stock'
            };
          }
        })
      );

      const isValid = validationResults.every(result => result.isValid);
      
      res.json({
        isValid,
        items: validationResults
      });
    } catch (error) {
      next(error);
    }
  };
} 