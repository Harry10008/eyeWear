import { AdminRepository } from '../repositories/admin.repository';
import { 
  LoginAdminDTO, 
  RegisterAdminDTO, 
  ResetPasswordAdminDTO, 
  ForgotPasswordAdminDTO,
  UpdatePasswordAdminDTO,
  UpdateAdminProfileDTO,
  AuthAdminResponseDTO,
  AdminResponseDTO,
  EmailTemplateData
} from '../dto/admin.dto';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../utils/email';
import { IAdmin } from '../models/admin.model';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  private mapAdminToAuthResponse(admin: IAdmin, token: string): AuthAdminResponseDTO {
    return {
      admin: {
        id: admin._id.toString(),
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        isEmailVerified: admin.isEmailVerified,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      },
      token
    };
  }

  async register(adminData: RegisterAdminDTO): Promise<AuthAdminResponseDTO> {
    try {
      // Validate passwords match
      if (adminData.password !== adminData.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Check if admin already exists
      const existingAdmin = await this.adminRepository.findByEmail(adminData.email);
      if (existingAdmin) {
        throw new AppError('Email already in use', 400);
      }

      // Create admin
      const admin = await this.adminRepository.createAdmin(adminData);

      // Generate token
      const token = this.adminRepository.generateToken(admin);

      // Update last login
      await this.adminRepository.updateLastLogin(admin._id);

      // Send welcome email
      const emailData: EmailTemplateData = {
        name: admin.fullName,
        verificationUrl: `${process.env.FRONTEND_URL}/admin/verify-email?token=${admin.generateEmailVerificationToken()}`
      };

      await sendEmail({
        email: admin.email,
        subject: 'Welcome to EyeWear Admin Panel',
        template: 'adminEmailVerification',
        data: emailData
      });

      return this.mapAdminToAuthResponse(admin, token);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to register admin', 500);
    }
  }

  async login(credentials: LoginAdminDTO): Promise<AuthAdminResponseDTO> {
    try {
      // Find admin with password
      const admin = await this.adminRepository.findByEmail(credentials.email, true);
      if (!admin) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if email is verified
      if (!admin.isEmailVerified) {
        throw new AppError('Please verify your email before logging in', 403);
      }

      // Validate password
      const isPasswordValid = await this.adminRepository.validatePassword(admin, credentials.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate token
      const token = this.adminRepository.generateToken(admin);

      // Update last login
      await this.adminRepository.updateLastLogin(admin._id);

      return this.mapAdminToAuthResponse(admin, token);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to login', 500);
    }
  }

  async forgotPassword(data: ForgotPasswordAdminDTO): Promise<void> {
    try {
      const admin = await this.adminRepository.findByEmail(data.email);
      if (!admin) {
        throw new AppError('No admin found with that email address', 404);
      }

      const resetToken = await this.adminRepository.createPasswordResetToken(data.email);

      // Send reset email
      const emailData: EmailTemplateData = {
        name: admin.fullName,
        resetUrl: `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`
      };

      await sendEmail({
        email: data.email,
        subject: 'Admin Password Reset Request',
        template: 'adminPasswordReset',
        data: emailData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process password reset request', 500);
    }
  }

  async resetPassword(data: ResetPasswordAdminDTO): Promise<void> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Validate password strength
      if (data.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      await this.adminRepository.resetPassword(data.token, data.password);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reset password', 500);
    }
  }

  async updatePassword(adminId: string, data: UpdatePasswordAdminDTO): Promise<void> {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Validate password strength
      if (data.newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      const admin = await this.adminRepository.updatePassword(adminId, data.currentPassword, data.newPassword);

      // Send password change notification email
      const emailData: EmailTemplateData = {
        name: admin.fullName
      };

      await sendEmail({
        email: admin.email,
        subject: 'Admin Password Changed',
        template: 'adminPasswordChanged',
        data: emailData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update password', 500);
    }
  }

  async updateProfile(adminId: string, data: UpdateAdminProfileDTO): Promise<AdminResponseDTO> {
    try {
      // If email is being updated, check if it's already in use
      if (data.email) {
        const existingAdmin = await this.adminRepository.findByEmail(data.email);
        if (existingAdmin && existingAdmin._id.toString() !== adminId) {
          throw new AppError('Email already in use', 400);
        }
      }

      const profile = await this.adminRepository.updateProfile(adminId, data);

      // If email was updated, send confirmation email
      if (data.email) {
        const emailData: EmailTemplateData = {
          name: profile.fullName
        };

        await sendEmail({
          email: data.email,
          subject: 'Admin Email Updated',
          template: 'adminEmailUpdated',
          data: emailData
        });
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update profile', 500);
    }
  }

  async getProfile(adminId: string): Promise<AdminResponseDTO> {
    try {
      return await this.adminRepository.getProfile(adminId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch profile', 500);
    }
  }

  async getDashboardStats() {
    try {
      return await this.adminRepository.getDashboardStats();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch dashboard stats', 500);
    }
  }

  async getUsers(page?: number, limit?: number) {
    try {
      return await this.adminRepository.getUsers(page, limit);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch users', 500);
    }
  }
} 