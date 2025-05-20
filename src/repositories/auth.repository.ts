import { User, IUser } from '../models/user.model';
import { 
  RegisterDTO, 
  UpdateProfileDTO, 
  UserResponseDTO
} from '../dto/auth.dto';
import { AppError } from '../utils/AppError';
import { Document } from 'mongoose';

export class AuthRepository {
  async findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
    const user = await User.findOne({ email })
      .select(includePassword ? '+password' : '-password')
      .exec();
    return user as (Document & IUser) | null;
  }

  async createUser(userData: RegisterDTO): Promise<IUser> {
    return User.create({
      ...userData,
      role: 'user',
      isEmailVerified: false
    });
  }

  async validatePassword(user: IUser, password: string): Promise<boolean> {
    try {
      return await user.comparePassword(password);
    } catch (error) {
      throw error;
    }
  }

  generateToken(user: IUser): string {
    return user.generateAuthToken();
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();
    return resetToken;
  }

  async resetPassword(token: string, password: string): Promise<IUser> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<IUser> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await this.validatePassword(user, currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDTO): Promise<UserResponseDTO> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.mapUserToResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponseDTO> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.mapUserToResponse(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { updatedAt: new Date() }
    });
  }

  private mapUserToResponse(user: IUser): UserResponseDTO {
    return {
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
    };
  }
} 