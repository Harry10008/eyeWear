import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ products: 1 });

// Virtual for product count
wishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

// Enable virtuals in JSON
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema); 