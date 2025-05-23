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
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await this.authService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };
} 