import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IOrderItem } from '../dtos/order.dto';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: IOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  shippingMethod: 'standard' | 'express' | 'next_day';
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  estimatedDeliveryDate: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  lensDetails: {
    type: {
      type: String,
      enum: ['single-vision', 'bifocal', 'progressive'],
    },
    power: {
      type: String,
    }
  },
  frameDetails: {
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
    },
    color: {
      type: String,
    }
  }
});

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9]{6}$/.test(v);
        },
        message: 'Please enter a valid 6-digit pincode'
      }
    }
  },
  billingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9]{6}$/.test(v);
        },
        message: 'Please enter a valid 6-digit pincode'
      }
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['credit_card', 'debit_card', 'upi', 'net_banking'],
      message: 'Invalid payment method'
    }
  },
  shippingMethod: {
    type: String,
    required: [true, 'Shipping method is required'],
    enum: {
      values: ['standard', 'express', 'next_day'],
      message: 'Invalid shipping method'
    }
  },
  shippingCost: {
    type: Number,
    required: true,
    min: [0, 'Shipping cost cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  orderStatus: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Invalid order status'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  shippingStatus: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered'],
      message: 'Invalid shipping status'
    },
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ shippingStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function (this: IOrder) {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate total
orderSchema.pre('save', function (next) {
  if (this.isModified('subtotal') || this.isModified('tax') || this.isModified('shippingCost')) {
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  next();
});

// Pre-save middleware to update dates based on status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    switch (this.orderStatus) {
      case 'delivered':
        this.estimatedDeliveryDate = new Date();
        break;
      case 'cancelled':
        this.cancelledAt = new Date();
        break;
    }
  }
  if (this.isModified('paymentStatus') && this.paymentStatus === 'refunded') {
    this.cancellationReason = 'Refunded';
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema); 