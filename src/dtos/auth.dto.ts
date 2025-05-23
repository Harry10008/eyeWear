export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  addresses: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault?: boolean;
  }[];
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
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
  addresses?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault?: boolean;
  }[];
  profilePicture?: string;
}

export interface AuthResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileResponseDTO {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  addresses: {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
  }[];
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
} 