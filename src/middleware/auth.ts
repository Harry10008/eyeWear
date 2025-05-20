import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is verified
    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email first', 401);
    }

    req.user = user;
    logger.info('User authenticated', { userId: user._id, role: user.role });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (!roles.includes(req.user.role)) {
    logger.warn('Unauthorized access attempt', { 
      userId: req.user._id, 
      role: req.user.role, 
      requiredRoles: roles 
    });
    throw new AppError('Not authorized to access this resource', 403);
  }

  logger.info('User authorized', { 
    userId: req.user._id, 
    role: req.user.role, 
    requiredRoles: roles 
  });
  next();
}; 