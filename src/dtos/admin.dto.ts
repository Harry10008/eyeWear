export interface AdminDashboardStatsDTO {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    totalSales: number;
    percentage: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
  }>;
}

export interface AdminProductStatsDTO {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface AdminUserStatsDTO {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  userGrowth: Array<{
    month: string;
    newUsers: number;
  }>;
}

export interface UserListDTO {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    lastLogin: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface RegisterAdminDTO {
  fullName: string;
  email: string;
  password: string;
  role?: 'admin' | 'super-admin';
}

export interface UpdateAdminProfileDTO {
  fullName?: string;
  email?: string;
}

export interface AdminResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'super-admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
} 