import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { 
  RegisterDTO, 
  LoginDTO, 
  ResetPasswordDTO, 
  ForgotPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO
} from '../dtos/auth.dto';
import { AppError } from '../utils/AppError';
import { User } from '../models/user.model';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: RegisterDTO = req.body;
      const result = await this.authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: LoginDTO = req.body;
      const result = await this.authService.login(credentials);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ForgotPasswordDTO = req.body;
      await this.authService.forgotPassword(data);
      res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ResetPasswordDTO = req.body;
      await this.authService.resetPassword(data);
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const data: UpdatePasswordDTO = req.body;
      await this.authService.updatePassword(userId, data);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const data: UpdateProfileDTO = req.body;
      const profile = await this.authService.updateProfile(userId, data);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await this.authService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user already has 5 addresses
      if (user.addresses.length >= 5) {
        throw new AppError('Maximum limit of 5 addresses reached', 400);
      }

      const newAddress = req.body;

      // If this is the first address or isDefault is true, set it as default
      if (user.addresses.length === 0 || newAddress.isDefault) {
        // Set all other addresses to non-default
        user.addresses.forEach(addr => addr.isDefault = false);
        newAddress.isDefault = true;
      }

      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json({
        status: 'success',
        data: {
          addresses: user.addresses
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          addresses: user.addresses
        }
      });
    } catch (error) {
      next(error);
    }
  };

  setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { addressId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        throw new AppError('Address not found', 404);
      }

      // Set all addresses to non-default
      user.addresses.forEach(addr => addr.isDefault = false);
      // Set the selected address as default
      user.addresses[addressIndex].isDefault = true;

      await user.save();

      res.status(200).json({
        status: 'success',
        data: {
          addresses: user.addresses
        }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { addressId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        throw new AppError('Address not found', 404);
      }

      const wasDefault = user.addresses[addressIndex].isDefault;
      user.addresses.splice(addressIndex, 1);

      // If we deleted the default address and there are other addresses,
      // set the first remaining address as default
      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      res.status(200).json({
        status: 'success',
        data: {
          addresses: user.addresses
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 