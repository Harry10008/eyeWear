import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}; 