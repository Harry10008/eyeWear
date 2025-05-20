import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authSchema } from '../validations/auth.validation';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  validateRequest(authSchema.register),
  authController.register
);//done

router.post(
  '/login',
  validateRequest(authSchema.login),
  authController.login
);//done

router.post(
  '/forgot-password',
  validateRequest(authSchema.forgotPassword),
  authController.forgotPassword
);//ok

router.post(
  '/reset-password',
  validateRequest(authSchema.resetPassword),
  authController.resetPassword
);

// Protected routes
router.use(authenticate);

router.patch(
  '/update-password',
  validateRequest(authSchema.updatePassword),
  authController.updatePassword
);

router.patch(
  '/profile',
  validateRequest(authSchema.updateProfile),
  authController.updateProfile
);

router.get('/profile', authController.getProfile);

export default router; 