import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  password: string;
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
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    addresses: [{
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    }],
    profilePicture: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    // If password is not selected, we need to fetch it
    if (!this.password) {
      const user = await User.findById(this._id).select('+password');
      if (!user) return false;
      return await bcrypt.compare(candidatePassword, user.password);
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  const payload = { id: this._id, role: this.role };
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, secret, options);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const payload = { id: this._id };
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: '24h' };
  const token = jwt.sign(payload, secret, options);

  this.emailVerificationToken = token;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const payload = { id: this._id };
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: '1h' };
  const token = jwt.sign(payload, secret, options);

  this.resetPasswordToken = token;
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  return token;
};

export const User = mongoose.model<IUser>('User', userSchema); 