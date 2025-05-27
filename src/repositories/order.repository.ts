import { Order, IOrder } from '../models/order.model';
import { Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos/order.dto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class OrderRepository {
  async create(orderData: CreateOrderDto & { user: Types.ObjectId }): Promise<IOrder> {
    try {
      const order = new Order(orderData);
      await order.save();
      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw new AppError('Failed to create order', 500);
    }
  }

  async findById(id: string): Promise<IOrder | null> {
    try {
      return await Order.findById(id)
        .populate('user', 'name email')
        .populate('items.product', 'name price images');
    } catch (error) {
      logger.error('Error finding order by ID:', error);
      throw new AppError('Failed to find order', 500);
    }
  }

  async findByUserId(userId: Types.ObjectId, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find({ user: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('items.product', 'name price images'),
        Order.countDocuments({ user: userId })
      ]);

      return { orders, total };
    } catch (error) {
      logger.error('Error finding orders by user ID:', error);
      throw new AppError('Failed to find orders', 500);
    }
  }

  async findAll(query: any = {}, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email')
          .populate('items.product', 'name price images'),
        Order.countDocuments(query)
      ]);

      return { orders, total };
    } catch (error) {
      logger.error('Error finding all orders:', error);
      throw new AppError('Failed to find orders', 500);
    }
  }

  async updateStatus(id: string, data: UpdateOrderStatusDto): Promise<IOrder | null> {
    try {
      const updateData: any = {};
      
      if (data.orderStatus) updateData.orderStatus = data.orderStatus;
      if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
      if (data.shippingStatus) updateData.shippingStatus = data.shippingStatus;
      if (data.trackingNumber) updateData.trackingNumber = data.trackingNumber;
      if (data.cancellationReason) updateData.cancellationReason = data.cancellationReason;

      const order = await Order.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).populate('user', 'name email')
       .populate('items.product', 'name price images');

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return order;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw new AppError('Failed to update order status', 500);
    }
  }

  async cancel(id: string, reason: string): Promise<IOrder | null> {
    try {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            orderStatus: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date()
          }
        },
        { new: true }
      ).populate('user', 'name email')
       .populate('items.product', 'name price images');

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return order;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw new AppError('Failed to cancel order', 500);
    }
  }
} 