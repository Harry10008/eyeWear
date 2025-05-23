import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from '../utils/AppError';
import { AdminRepository } from '../repositories/admin.repository';

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // 3) Check if admin still exists
    const adminRepository = new AdminRepository();
    const admin = await adminRepository.findById(decoded.id);

    if (!admin) {
      return next(new AppError('The admin belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.admin = admin;
    next();
  } catch (error) {
    next(new AppError('Invalid token. Please log in again!', 401));
  }
}; 