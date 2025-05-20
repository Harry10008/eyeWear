import { AuthRepository } from '../repositories/auth.repository';
import { 
  LoginDTO, 
  RegisterDTO, 
  ResetPasswordDTO, 
  ForgotPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
  AuthResponseDTO,
  UserResponseDTO,
  EmailTemplateData
} from '../dto/auth.dto';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../utils/email';
import { IUser } from '../models/user.model';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private mapUserToAuthResponse(user: IUser, token: string): AuthResponseDTO {
    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    };
  }

  async register(userData: RegisterDTO): Promise<AuthResponseDTO> {
    try {
      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Check if user already exists
      const existingUser = await this.authRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }

      // Create user
      const user = await this.authRepository.createUser(userData);

      // Generate token
      const token = this.authRepository.generateToken(user);

      // Update last login
      await this.authRepository.updateLastLogin(user._id);

      // Send welcome email
      const emailData: EmailTemplateData = {
        name: user.fullName,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${user.generateEmailVerificationToken()}`
      };

      await sendEmail({
        email: user.email,
        subject: 'Welcome to EyeWear',
        template: 'emailVerification',
        data: emailData
      });

      return this.mapUserToAuthResponse(user, token);
    } catch (error) {
        console.log("error",error)
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to register user', 500);
    }
  }

  async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    try {
      // Find user with password
      const user = await this.authRepository.findByEmail(credentials.email, true);
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new AppError('Please verify your email before logging in', 403);
      }

      // Validate password
      const isPasswordValid = await this.authRepository.validatePassword(user, credentials.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate token
      const token = this.authRepository.generateToken(user);

      // Update last login
      await this.authRepository.updateLastLogin(user._id);

      return this.mapUserToAuthResponse(user, token);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to login', 500);
    }
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    try {
      const user = await this.authRepository.findByEmail(data.email);
      if (!user) {
        throw new AppError('No user found with that email address', 404);
      }

      const resetToken = await this.authRepository.createPasswordResetToken(data.email);

      // Send reset email
      const emailData: EmailTemplateData = {
        name: user.fullName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      };

      await sendEmail({
        email: data.email,
        subject: 'Password Reset Request',
        template: 'passwordReset',
        data: emailData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process password reset request', 500);
    }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Validate password strength
      if (data.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      await this.authRepository.resetPassword(data.token, data.password);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reset password', 500);
    }
  }

  async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<void> {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      // Validate password strength
      if (data.newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      const user = await this.authRepository.updatePassword(userId, data.currentPassword, data.newPassword);

      // Send password change notification email
      const emailData: EmailTemplateData = {
        name: user.fullName
      };

      await sendEmail({
        email: user.email,
        subject: 'Password Changed',
        template: 'passwordChanged',
        data: emailData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update password', 500);
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserResponseDTO> {
    try {
      // If email is being updated, check if it's already in use
      if (data.email) {
        const existingUser = await this.authRepository.findByEmail(data.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new AppError('Email already in use', 400);
        }
      }

      const profile = await this.authRepository.updateProfile(userId, data);

      // If email was updated, send confirmation email
      if (data.email) {
        const emailData: EmailTemplateData = {
          name: profile.fullName
        };

        await sendEmail({
          email: data.email,
          subject: 'Email Updated',
          template: 'emailUpdated',
          data: emailData
        });
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update profile', 500);
    }
  }

  async getProfile(userId: string): Promise<UserResponseDTO> {
    try {
      return await this.authRepository.getProfile(userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch profile', 500);
    }
  }
} 