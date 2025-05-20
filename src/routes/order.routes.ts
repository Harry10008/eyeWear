import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { orderSchema } from '../validations/order.schema';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} from '../controllers/order.controller';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Create new order
router.post(
  '/',
  validateRequest(orderSchema.create),
  createOrder
);

// Get all orders for the user
router.get('/', getOrders);

// Get specific order
router.get('/:id', getOrder);

// Update order status (admin only)
router.patch(
  '/:id/status',
  validateRequest(orderSchema.updateStatus),
  updateOrderStatus
);

// Cancel order
router.post(
  '/:id/cancel',
  validateRequest(orderSchema.cancel),
  cancelOrder
);

// Admin: Get all orders with filters
router.get('/admin/all', getAllOrders);

export default router; 