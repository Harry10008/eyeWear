import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

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