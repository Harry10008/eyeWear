import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', (_req, res) => {
  res.json({ message: 'User profile endpoint' });
});

// Update user profile
router.put('/profile', (_req, res) => {
  res.json({ message: 'Update profile endpoint' });
});

export default router; 