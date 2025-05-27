import { Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface IPower {
  sphere?: number;
  cylinder?: number;
  axis?: number;
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

export interface CreateOrderDto {
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  shippingMethod: 'standard' | 'express' | 'next_day';
  notes?: string;
  shippingCost?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  estimatedDeliveryDate?: Date;
  orderStatus?: string;
  paymentStatus?: string;
  shippingStatus?: string;
}

export interface UpdateOrderStatusDto {
  orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingStatus?: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  cancellationReason?: string;
}

export interface CancelOrderDto {
  reason: string;
}

export interface OrderResponseDto {
  _id: Types.ObjectId;
  user: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
} 