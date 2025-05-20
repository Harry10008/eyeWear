import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/order.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate, authorize } from '../middleware/auth';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from '../validations/order.schema';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.post('/', validateRequest(createOrderSchema), createOrder);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.use(authorize('admin'));
router.get('/', getAllOrders);
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.patch('/:id/payment', validateRequest(updatePaymentStatusSchema), updatePaymentStatus);

export default router; 