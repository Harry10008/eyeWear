import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const admin = await this.adminService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: admin
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const admin = await this.adminService.login(req.body);
    res.status(200).json({
      status: 'success',
      data: admin
    });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await this.adminService.forgotPassword(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    await this.adminService.resetPassword(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  });

  updatePassword = catchAsync(async (req: Request, res: Response) => {
    await this.adminService.updatePassword(req.user!._id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const profile = await this.adminService.updateProfile(req.user!._id, req.body);
    res.status(200).json({
      status: 'success',
      data: profile
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const profile = await this.adminService.getProfile(req.user!._id);
    res.status(200).json({
      status: 'success',
      data: profile
    });
  });

  getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await this.adminService.getDashboardStats();
    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  getUsers = catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const users = await this.adminService.getUsers(page, limit);
    res.status(200).json({
      status: 'success',
      data: users
    });
  });
} 