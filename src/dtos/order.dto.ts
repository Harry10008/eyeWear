import { Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
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
  lensType?: string;
  lensColor?: string;
  power?: {
    leftEye?: IPower;
    rightEye?: IPower;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
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