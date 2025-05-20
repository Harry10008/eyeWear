import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getRecommendations,
} from '../controllers/product.controller';
import { authenticate, authorize, requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { productSchema } from '../validations/product.schema';
import { reviewSchema } from '../validations/review.schema';

const router = express.Router();

// Public routes
router.get('/', getProducts); //ok
router.get('/:id', getProduct);
router.get('/:id/recommendations', getRecommendations);

// Protected routes - require authentication
router.use(authenticate);

// User routes - require authentication
router.post('/:id/reviews', requireAuth, validateRequest(reviewSchema), addReview);

// Admin routes - require admin role
router.use(authorize('admin'));
router.post('/', validateRequest(productSchema), createProduct);//ok
router.put('/:id', validateRequest(productSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router; 