export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault?: boolean;
  };
  profilePicture?: string;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
  }>;
  profilePicture?: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateData {
  name: string;
  verificationUrl?: string;
  resetUrl?: string;
} 