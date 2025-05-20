import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
} from '../controllers/cart.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { cartItemSchema, updateCartItemSchema } from '../validations/cart.schema';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get('/', getCart);
router.post('/', validateRequest(cartItemSchema), addToCart);
router.put('/:itemId', validateRequest(updateCartItemSchema), updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);
router.post('/validate', validateCart);

export default router; 