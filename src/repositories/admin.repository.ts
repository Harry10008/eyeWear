import { User, IUser } from '../models/user.model';
import { Order } from '../models/order.model';
import { Product, IProduct } from '../models/product.model';
import { 
  UserListDTO, 
  AdminDashboardStatsDTO, 
  AdminProductStatsDTO, 
  AdminUserStatsDTO,
  UpdateAdminProfileDTO,
  AdminResponseDTO
} from '../dtos/admin.dto';
import { Admin, IAdmin } from '../models/admin.model';
import { AppError } from '../utils/AppError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';
import bcrypt from 'bcryptjs';

export class AdminRepository {
  async getDashboardStats(): Promise<AdminDashboardStatsDTO> {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      recentOrders,
      topProducts,
      salesByCategory,
      monthlySales
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      User.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName'),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$category', total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            sales: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        customerName: (order.user as IUser).fullName,
        amount: order.total,
        status: order.orderStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        createdAt: order.createdAt
      })),
      topProducts: topProducts.map(product => ({
        id: product._id.toString(),
        name: product.name,
        totalSold: product.totalSold,
        revenue: product.price * product.totalSold
      })),
      salesByCategory: salesByCategory.map(category => ({
        category: category._id,
        totalSales: category.total,
        percentage: (category.total / totalRevenue[0]?.total) * 100
      })),
      monthlySales: monthlySales.map(month => ({
        month: month._id,
        sales: month.sales
      }))
    };
  }

  async getProductStats(): Promise<AdminProductStatsDTO> {
    const [
      totalProducts,
      categories,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      categoryDistribution
    ] = await Promise.all([
      Product.countDocuments(),
      Product.distinct('category'),
      Product.countDocuments({ stock: { $lt: 10 } }),
      Product.countDocuments({ stock: 0 }),
      Product.find()
        .sort({ totalSold: -1 })
        .limit(5),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalProducts,
      totalCategories: categories.length,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts: topSellingProducts.map((product: IProduct) => ({
        id: product._id.toString(),
        name: product.name,
        totalSold: product.totalSold,
        revenue: product.price * product.totalSold
      })),
      categoryDistribution: categoryDistribution.map((category: { _id: string; count: number }) => ({
        category: category._id,
        count: category.count,
        percentage: (category.count / totalProducts) * 100
      }))
    };
  }

  async getUserStats(): Promise<AdminUserStatsDTO> {
    const [
      totalUsers,
      activeUsers,
      newUsers,
      topCustomers,
      userGrowth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.aggregate([
        { $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'orders' } },
        { $project: { name: 1, totalOrders: { $size: '$orders' }, totalSpent: { $sum: '$orders.total' } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ]),
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsers,
      topCustomers: topCustomers.map(customer => ({
        id: customer._id.toString(),
        name: customer.name,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent
      })),
      userGrowth: userGrowth.map(month => ({
        month: month._id,
        newUsers: month.newUsers
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

  async findById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id).lean();
  }

  async findByEmail(email: string, selectPassword = false): Promise<IAdmin | null> {
    return Admin.findOne({ email }).select(selectPassword ? '+password' : '').lean();
  }

  async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
    const admin = await Admin.create(adminData);
    return admin.toObject();
  }

  async validatePassword(admin: IAdmin, password: string): Promise<boolean> {
    return bcrypt.compare(password, admin.password);
  }

  generateToken(admin: IAdmin): string {
    const payload = { id: admin._id };
    const options: SignOptions = { expiresIn: `${config.jwt.expiresIn}s` };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const admin = await this.findByEmail(email);
    if (!admin) {
      throw new AppError('No admin found with that email address', 404);
    }

    const payload = { id: admin._id };
    const options: SignOptions = { expiresIn: '1h' };
    const resetToken = jwt.sign(payload, config.jwt.secret, options);

    await Admin.findByIdAndUpdate(admin._id, {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
      }
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const admin = await Admin.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    await Admin.findByIdAndUpdate(admin._id, {
      $set: {
        password: newPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      }
    });
  }

  async updatePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isPasswordValid = await this.validatePassword(admin, currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    await Admin.findByIdAndUpdate(adminId, {
      $set: { password: newPassword }
    });
  }

  async updateProfile(adminId: string, updateData: UpdateAdminProfileDTO): Promise<AdminResponseDTO> {
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return this.mapAdminToResponse(admin);
  }

  async getProfile(adminId: string): Promise<AdminResponseDTO> {
    const admin = await Admin.findById(adminId).select('-password').lean();
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return this.mapAdminToResponse(admin);
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await Admin.findByIdAndUpdate(adminId, {
      $set: { lastLogin: new Date() }
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