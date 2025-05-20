import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  updateCategoryOrder,
} from '../controllers/category.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate, authorize } from '../middleware/auth';
import { categorySchema, categoryOrderSchema } from '../validations/category.schema';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/products', getCategoryProducts);

// Protected routes - require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin routes
router.post('/', validateRequest(categorySchema), createCategory);
router.put('/:id', validateRequest(categorySchema), updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/order', validateRequest(categoryOrderSchema), updateCategoryOrder);

export default router; 