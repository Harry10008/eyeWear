import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
} from '../controllers/wishlist.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { wishlistItemSchema } from '../validations/wishlist.schema';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Wishlist routes
router.get('/', getWishlist);
router.post('/', validateRequest(wishlistItemSchema), addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);
router.get('/check/:productId', checkWishlistItem);

export default router; 