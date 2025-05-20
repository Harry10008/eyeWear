import { Order, IOrder } from '../models/order.model';
import { Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos/order.dto';

export class OrderRepository {
  async create(data: CreateOrderDto & { user: Types.ObjectId }): Promise<IOrder> {
    return Order.create(data);
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id);
  }

  async findByUserId(userId: Types.ObjectId, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'items.product',
          select: 'name description price images brand',
        }),
      Order.countDocuments({ user: userId })
    ]);

    return { orders, total };
  }

  async findAll(query: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'user',
          select: 'name email',
        })
        .populate({
          path: 'items.product',
          select: 'name description price images brand',
        }),
      Order.countDocuments(query)
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, data: UpdateOrderStatusDto): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { 
        orderStatus: data.status,
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber })
      },
      { new: true }
    );
  }

  async cancel(id: string, reason: string): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { 
        orderStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      },
      { new: true }
    );
  }
} 