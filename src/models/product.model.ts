import mongoose, { Document, Schema } from 'mongoose';

// Import Category model to ensure it's registered
require('./category.model');

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  category: mongoose.Types.ObjectId;
  subCategory: mongoose.Types.ObjectId;
  brand: string;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  type: 'sunglasses' | 'screenGlasses' | 'powerGlasses';
  frameMaterial?: string;
  frameColor?: string;
  lensType?: string;
  lensColor?: string;
  lensWidth?: number;
  bridgeWidth?: number;
  templeLength?: number;
  frameWidth?: number;
  frameHeight?: number;
  features?: string[];
  images?: string[];
  stock?: number;
  isActive?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  reviews?: Array<{
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    offerPrice: {
      type: Number,
      min: [0, 'Offer price cannot be negative'],
      validate: {
        validator: function (this: IProduct, value: number) {
          return value < this.price;
        },
        message: 'Offer price must be less than regular price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product subcategory is required'],
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Product gender is required'],
      enum: ['men', 'women', 'unisex', 'kids'],
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      enum: ['sunglasses', 'screenGlasses', 'powerGlasses'],
    },
    frameMaterial: {
      type: String,
    },
    frameColor: {
      type: String,
    },
    lensType: {
      type: String,
    },
    lensColor: {
      type: String,
    },
    lensWidth: {
      type: Number,
      min: [0, 'Lens width cannot be negative'],
    },
    bridgeWidth: {
      type: Number,
      min: [0, 'Bridge width cannot be negative'],
    },
    templeLength: {
      type: Number,
      min: [0, 'Temple length cannot be negative'],
    },
    frameWidth: {
      type: Number,
      min: [0, 'Frame width cannot be negative'],
    },
    frameHeight: {
      type: Number,
      min: [0, 'Frame height cannot be negative'],
    },
    features: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative'],
      },
    },
    reviews: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ gender: 1, type: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });

// Update average rating when a review is added or modified
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    // Initialize reviews and ratings if they don't exist
    if (!this.reviews) {
      this.reviews = [];
    }
    if (!this.ratings) {
      this.ratings = {
        average: 0,
        count: 0
      };
    }

    const totalRatings = this.reviews!.reduce((sum, review) => sum + review.rating, 0);
    this.ratings!.average = this.reviews!.length > 0 ? totalRatings / this.reviews!.length : 0;
    this.ratings!.count = this.reviews!.length;
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema); 