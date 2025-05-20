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

export interface RegisterAdminDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'admin' | 'super-admin';
}

export interface LoginAdminDTO {
  email: string;
  password: string;
}

export interface ResetPasswordAdminDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordAdminDTO {
  email: string;
}

export interface UpdatePasswordAdminDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

export interface AuthAdminResponseDTO {
  admin: AdminResponseDTO;
  token: string;
}

export interface EmailTemplateData {
  name: string;
  verificationUrl?: string;
  resetUrl?: string;
} 