export interface AdminDashboardStatsDTO {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
  }>;
}

export interface UserListDTO {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: Date;
    lastLogin: Date;
  }>;
  total: number;
  page: number;
  limit: number;
} 