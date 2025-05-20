import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { Admin, IAdmin } from '../models/admin.model';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  role: string;
}

// Create a union type for authenticated users
type AuthenticatedUser = (IUser | IAdmin) & { _id: any };

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Type guard to check if request is authenticated
const isAuthenticatedRequest = (req: Request): req is Request & { user: AuthenticatedUser } => {
  return req.user !== undefined;
};

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

    let authenticatedUser: AuthenticatedUser | null = null;

    // Try to find user first
    const userDoc = await User.findById(decoded.id).select('-password').lean();
    if (userDoc) {
      authenticatedUser = userDoc as IUser & { _id: any };
    } else {
      // If not found, try to find admin
      const adminDoc = await Admin.findById(decoded.id).select('-password').lean();
      if (adminDoc) {
        authenticatedUser = adminDoc as IAdmin & { _id: any };
      }
    }

    if (!authenticatedUser) {
      throw new AppError('User not found', 404);
    }

    // Check if user/admin is verified
    if (!authenticatedUser.isEmailVerified) {
      throw new AppError('Please verify your email first', 401);
    }

    req.user = authenticatedUser;
    logger.info('User authenticated', { 
      userId: authenticatedUser._id, 
      role: authenticatedUser.role 
    });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Middleware to ensure request is authenticated
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!isAuthenticatedRequest(req)) {
    throw new AppError('Authentication required', 401);
  }
  next();
};

export const authorize = (...roles: string[]) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!isAuthenticatedRequest(req)) {
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