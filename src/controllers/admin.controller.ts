import { Response, NextFunction } from 'express';
import { Request } from '../types/express';
import { AdminRepository } from '../repositories/admin.repository';
import { AppError } from '../utils/AppError';

export class AdminController {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminRepository.getDashboardStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getProductStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminRepository.getProductStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getUserStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminRepository.getUserStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.adminRepository.getUsers(page, limit);
      res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await this.adminRepository.createAdmin(req.body);
      const token = this.adminRepository.generateToken(admin);
      res.status(201).json({
        status: 'success',
        token,
        data: {
          admin: {
            id: admin._id.toString(),
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            isEmailVerified: admin.isEmailVerified,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const admin = await this.adminRepository.findByEmail(email, true);
      
      if (!admin || !(await this.adminRepository.validatePassword(admin, password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

      const token = this.adminRepository.generateToken(admin);
      await this.adminRepository.updateLastLogin(admin._id);

      res.status(200).json({
        status: 'success',
        token,
        data: {
          admin: {
            id: admin._id.toString(),
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            isEmailVerified: admin.isEmailVerified,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return next(new AppError('Not authenticated', 401));
      }
      const admin = await this.adminRepository.getProfile(req.admin._id);
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return next(new AppError('Not authenticated', 401));
      }
      const admin = await this.adminRepository.updateProfile(req.admin._id, req.body);
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return next(new AppError('Not authenticated', 401));
      }
      const { currentPassword, newPassword } = req.body;
      await this.adminRepository.updatePassword(req.admin._id, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resetToken = await this.adminRepository.createPasswordResetToken(req.body.email);
      res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email',
        resetToken // Remove this in production
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await this.adminRepository.resetPassword(token, password);
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };
} 