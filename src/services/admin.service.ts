import { AdminRepository } from '../repositories/admin.repository';
import { AdminDashboardStatsDTO, UserListDTO } from '../dto/admin.dto';
import { AppError } from '../utils/AppError';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async getDashboardStats(): Promise<AdminDashboardStatsDTO> {
    try {
      return await this.adminRepository.getDashboardStats();
    } catch (error) {
      throw new AppError('Failed to fetch dashboard stats', 500);
    }
  }

  async getUsers(page?: number, limit?: number): Promise<UserListDTO> {
    try {
      if (page && page < 1) {
        throw new AppError('Page number must be greater than 0', 400);
      }
      if (limit && (limit < 1 || limit > 100)) {
        throw new AppError('Limit must be between 1 and 100', 400);
      }
      
      return await this.adminRepository.getUsers(page, limit);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch users', 500);
    }
  }
} 