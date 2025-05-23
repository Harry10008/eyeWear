import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'super-admin';
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const adminSchema = new Schema<IAdmin>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) {
      const admin = await Admin.findById(this._id).select('+password');
      if (!admin) return false;
      return await bcrypt.compare(candidatePassword, admin.password);
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate JWT token
adminSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
};

// Generate email verification token
adminSchema.methods.generateEmailVerificationToken = function(): string {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Generate password reset token
adminSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  return resetToken;
};

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema); 