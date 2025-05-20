import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IOrder } from './order.model';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId | IUser;
  order: mongoose.Types.ObjectId | IOrder;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentGateway: string;
  transactionId: string;
  paymentDate: Date;
  refundDate?: Date;
  refundReason?: string;
  refundAmount?: number;
  paymentDetails: {
    cardNumber?: string;
    cardType?: string;
    cardHolderName?: string;
    expiryDate?: string;
    upiId?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  errorDetails?: {
    code: string;
    message: string;
    gatewayResponse?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['credit_card', 'debit_card', 'upi', 'net_banking'],
        message: 'Invalid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      required: [true, 'Payment gateway is required'],
      trim: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    refundDate: {
      type: Date,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
    },
    paymentDetails: {
      cardNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
              return /^\d{16}$/.test(value);
            }
            return true;
          },
          message: 'Invalid card number',
        },
      },
      cardType: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
              return ['visa', 'mastercard', 'amex', 'discover'].includes(value.toLowerCase());
            }
            return true;
          },
          message: 'Invalid card type',
        },
      },
      cardHolderName: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
              return value && value.length >= 3;
            }
            return true;
          },
          message: 'Card holder name is required for card payments',
        },
      },
      expiryDate: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
              return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value);
            }
            return true;
          },
          message: 'Invalid expiry date format (MM/YY)',
        },
      },
      upiId: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'upi') {
              return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(value);
            }
            return true;
          },
          message: 'Invalid UPI ID',
        },
      },
      bankName: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'net_banking') {
              return value && value.length >= 2;
            }
            return true;
          },
          message: 'Bank name is required for net banking',
        },
      },
      accountNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'net_banking') {
              return /^\d{9,18}$/.test(value);
            }
            return true;
          },
          message: 'Invalid account number',
        },
      },
      ifscCode: {
        type: String,
        trim: true,
        validate: {
          validator: function (this: IPayment, value: string) {
            if (this.paymentMethod === 'net_banking') {
              return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
            }
            return true;
          },
          message: 'Invalid IFSC code',
        },
      },
    },
    errorDetails: {
      code: {
        type: String,
        trim: true,
      },
      message: {
        type: String,
        trim: true,
      },
      gatewayResponse: {
        type: Schema.Types.Mixed,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentDate: 1 });

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function (this: IPayment) {
  return Math.floor((Date.now() - this.paymentDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate payment details based on payment method
paymentSchema.pre('save', function (next) {
  if (this.isModified('paymentMethod') || this.isModified('paymentDetails')) {
    const requiredFields = {
      credit_card: ['cardNumber', 'cardType', 'cardHolderName', 'expiryDate'],
      debit_card: ['cardNumber', 'cardType', 'cardHolderName', 'expiryDate'],
      upi: ['upiId'],
      net_banking: ['bankName', 'accountNumber', 'ifscCode'],
    };

    const method = this.paymentMethod;
    const details = this.paymentDetails;
    const missingFields = requiredFields[method].filter(
      (field) => !details[field]
    );

    if (missingFields.length > 0) {
      next(new Error(`Missing required fields for ${method}: ${missingFields.join(', ')}`));
      return;
    }
  }
  next();
});

// Pre-save middleware to update refund date
paymentSchema.pre('save', function (next) {
  if (this.isModified('paymentStatus') && this.paymentStatus === 'refunded') {
    this.refundDate = new Date();
  }
  next();
});

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema); 