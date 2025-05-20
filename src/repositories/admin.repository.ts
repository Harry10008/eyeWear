import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { UserListDTO, AdminDashboardStatsDTO } from '../dto/admin.dto';

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
} 