import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { Admin, IAdmin } from '../models/admin.model';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config/config';

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
      admin?: IAdmin;
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
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new AppError('No authorization header', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      throw error;
    }

    let authenticatedUser: AuthenticatedUser | null = null;

    // Check if it's an admin token
    if (decoded.role === 'admin' || decoded.role === 'super-admin') {
      const adminDoc = await Admin.findById(decoded.id).select('-password').lean();
      if (adminDoc) {
        authenticatedUser = adminDoc as IAdmin & { _id: any };
        req.admin = adminDoc;
      }
    } else {
      // Try to find user
      const userDoc = await User.findById(decoded.id).select('-password').lean();
      if (userDoc) {
        authenticatedUser = userDoc as IUser & { _id: any };
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
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
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