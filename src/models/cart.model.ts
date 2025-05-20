import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  lensType?: string;
  lensColor?: string;
  power?: {
    leftEye: {
      sphere: number;
      cylinder: number;
      axis: number;
    };
    rightEye: {
      sphere: number;
      cylinder: number;
      axis: number;
    };
  };
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
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
  lensType: {
    type: String,
  },
  lensColor: {
    type: String,
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

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: [0, 'Total items cannot be negative'],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

// Create indexes
cartSchema.index({ user: 1 });

// Virtual for formatted total amount
cartSchema.virtual('formattedTotalAmount').get(function () {
  return this.totalAmount.toFixed(2);
});

// Enable virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = mongoose.model<ICart>('Cart', cartSchema); 