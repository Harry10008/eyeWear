import express from 'express';
import { authenticate, authorize, requireAuth } from '../middleware/auth';
import { AdminController } from '../controllers/admin.controller';

const router = express.Router();
const adminController = new AdminController();

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Protected routes - require authentication
router.use(authenticate);

// Verify admin token
router.get('/verify-token', requireAuth, adminController.getProfile);

// Admin only routes
router.use(authorize('admin'));

// Profile management
router.patch('/profile', requireAuth, adminController.updateProfile);
router.patch('/update-password', requireAuth, adminController.updatePassword);

// Admin dashboard and user management
router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);

export default router; 