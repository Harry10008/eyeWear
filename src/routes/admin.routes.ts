import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AdminController } from '../controllers/admin.controller';

const router = express.Router();
const adminController = new AdminController();

// Protected routes - require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Manage users
router.get('/users', adminController.getUsers);

export default router; 