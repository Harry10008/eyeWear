import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IAddress, IOrderItem } from '../dtos/order.dto';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  paymentMethod: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
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
    required: [true, 'Product is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  lensType: {
    type: String,
    trim: true,
  },
  lensColor: {
    type: String,
    trim: true,
  },
  power: {
    leftEye: {
      sphere: {
        type: Number,
        min: -20,
        max: 20,
      },
      cylinder: {
        type: Number,
        min: -6,
        max: 6,
      },
      axis: {
        type: Number,
        min: 0,
        max: 180,
      },
    },
    rightEye: {
      sphere: {
        type: Number,
        min: -20,
        max: 20,
      },
      cylinder: {
        type: Number,
        min: -6,
        max: 6,
      },
      axis: {
        type: Number,
        min: 0,
        max: 180,
      },
    },
  },
});

const addressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: addressSchema,
      required: [true, 'Shipping address is required'],
    },
    billingAddress: {
      type: addressSchema,
      required: [true, 'Billing address is required'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['credit_card', 'debit_card', 'upi', 'net_banking'],
        message: 'Invalid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    shippingMethod: {
      type: String,
      enum: {
        values: ['standard', 'express', 'next_day'],
        message: 'Invalid shipping method',
      },
      required: [true, 'Shipping method is required'],
    },
    shippingCost: {
      type: Number,
      required: [true, 'Shipping cost is required'],
      min: [0, 'Shipping cost cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
      min: [0, 'Tax cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Invalid order status',
      },
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'pending',
    },
    shippingStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered'],
        message: 'Invalid shipping status',
      },
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ trackingNumber: 1 });

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