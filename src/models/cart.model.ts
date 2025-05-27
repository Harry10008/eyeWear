import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  lensDetails?: {
    type: 'single-vision' | 'bifocal' | 'progressive';
    power: string;
  };
  frameDetails?: {
    size: 'small' | 'medium' | 'large';
    color: string;
  };
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  total: number;
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

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate total before saving
cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// Create indexes
cartSchema.index({ user: 1 });

// Virtual for formatted total amount
cartSchema.virtual('formattedTotalAmount').get(function () {
  return this.total.toFixed(2);
});

// Enable virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = mongoose.model<ICart>('Cart', cartSchema); 