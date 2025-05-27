import { Document, Types } from 'mongoose';

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
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
  user: Types.ObjectId;
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
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