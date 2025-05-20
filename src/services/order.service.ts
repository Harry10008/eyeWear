import { Types } from 'mongoose';
import { OrderRepository } from '../repositories/order.repository';
import { Cart } from '../models/cart.model';
import { AppError } from '../middleware/errorHandler';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos/order.dto';
import { logger } from '../utils/logger';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  private calculateShippingCost(method: string, subtotal: number): number {
    switch (method) {
      case 'standard':
        return subtotal > 100 ? 0 : 10;
      case 'express':
        return 20;
      case 'next_day':
        return 30;
      default:
        return 0;
    }
  }

  private calculateTax(subtotal: number): number {
    return subtotal * 0.1; // 10% tax
  }

  private calculateEstimatedDeliveryDate(method: string): Date {
    const date = new Date();
    switch (method) {
      case 'standard':
        date.setDate(date.getDate() + 5);
        break;
      case 'express':
        date.setDate(date.getDate() + 2);
        break;
      case 'next_day':
        date.setDate(date.getDate() + 1);
        break;
      default:
        date.setDate(date.getDate() + 5);
    }
    return date;
  }

  async createOrder(userId: Types.ObjectId, orderData: CreateOrderDto) {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Calculate order totals
    const subtotal = cart.totalAmount;
    const shippingCost = this.calculateShippingCost(orderData.shippingMethod, subtotal);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shippingCost + tax;

    // Create order with calculated values
    const order = await this.orderRepository.create({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        lensType: item.lensType,
        lensColor: item.lensColor,
        power: item.power,
      })),
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      paymentMethod: orderData.paymentMethod,
      shippingMethod: orderData.shippingMethod,
      notes: orderData.notes,
      shippingCost,
      subtotal,
      tax,
      total,
      estimatedDeliveryDate: this.calculateEstimatedDeliveryDate(orderData.shippingMethod),
      orderStatus: 'pending',
      paymentStatus: 'pending',
      shippingStatus: 'pending'
    });

    // Clear cart after successful order creation
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    await cart.save();

    logger.info('New order created', { 
      orderId: order._id,
      userId 
    });

    return order;
  }

  async getOrders(userId: Types.ObjectId, page: number = 1, limit: number = 10) {
    return this.orderRepository.findByUserId(userId, page, limit);
  }

  async getOrder(orderId: string, userId: Types.ObjectId) {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.user.toString() !== userId.toString()) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await this.orderRepository.updateStatus(orderId, data);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    logger.info('Order status updated', {
      orderId: order._id,
      status: order.orderStatus,
      trackingNumber: order.trackingNumber
    });

    return order;
  }

  async cancelOrder(orderId: string, userId: Types.ObjectId, reason: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.user.toString() !== userId.toString()) {
      throw new AppError('Order not found', 404);
    }

    if (order.orderStatus !== 'pending') {
      throw new AppError('Order cannot be cancelled', 400);
    }

    const cancelledOrder = await this.orderRepository.cancel(orderId, reason);
    logger.info('Order cancelled', {
      orderId: cancelledOrder!._id,
      userId,
      reason
    });

    return cancelledOrder;
  }

  async getAllOrders(query: any = {}, page: number = 1, limit: number = 10) {
    return this.orderRepository.findAll(query, page, limit);
  }
} 