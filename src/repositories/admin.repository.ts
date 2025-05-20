import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { UserListDTO, AdminDashboardStatsDTO } from '../dto/admin.dto';
import { Admin, IAdmin } from '../models/admin.model';
import { 
  RegisterAdminDTO, 
  UpdateAdminProfileDTO, 
  AdminResponseDTO
} from '../dto/admin.dto';
import { AppError } from '../utils/AppError';
import { Document } from 'mongoose';

export class AdminRepository {
  async getDashboardStats(): Promise<AdminDashboardStatsDTO> {
    const [totalUsers, totalOrders, totalProducts, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName email')
        .lean()
    ]);

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        customerName: (order.user as { fullName: string }).fullName,
        amount: order.total,
        status: order.orderStatus,
        createdAt: order.createdAt
      }))
    };
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<UserListDTO> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean(),
      User.countDocuments()
    ]);

    return {
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.updatedAt // Using updatedAt as lastLogin since we don't have lastLogin field
      })),
      total,
      page,
      limit
    };
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ email })
      .select(includePassword ? '+password' : '-password')
      .exec();
    return admin as (Document & IAdmin) | null;
  }

  async createAdmin(adminData: RegisterAdminDTO): Promise<IAdmin> {
    return Admin.create({
      ...adminData,
      role: adminData.role || 'admin',
      isEmailVerified: false
    });
  }

  async validatePassword(admin: IAdmin, password: string): Promise<boolean> {
    try {
      return await admin.comparePassword(password);
    } catch (error) {
      throw error;
    }
  }

  generateToken(admin: IAdmin): string {
    return admin.generateAuthToken();
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const admin = await this.findByEmail(email);
    if (!admin) {
      throw new AppError('No admin found with that email address', 404);
    }

    const resetToken = admin.generatePasswordResetToken();
    await admin.save();
    return resetToken;
  }

  async resetPassword(token: string, password: string): Promise<IAdmin> {
    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return admin;
  }

  async updatePassword(adminId: string, currentPassword: string, newPassword: string): Promise<IAdmin> {
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isPasswordValid = await this.validatePassword(admin, currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    admin.password = newPassword;
    await admin.save();

    return admin;
  }

  async updateProfile(adminId: string, updateData: UpdateAdminProfileDTO): Promise<AdminResponseDTO> {
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return this.mapAdminToResponse(admin);
  }

  async getProfile(adminId: string): Promise<AdminResponseDTO> {
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return this.mapAdminToResponse(admin);
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await Admin.findByIdAndUpdate(adminId, {
      $set: { updatedAt: new Date() }
    });
  }

  private mapAdminToResponse(admin: IAdmin): AdminResponseDTO {
    return {
      id: admin._id.toString(),
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      isEmailVerified: admin.isEmailVerified,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  }
} 