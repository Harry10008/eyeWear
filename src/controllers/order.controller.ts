import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';

const orderService = new OrderService();

// Create order from cart
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!._id, req.body);
  
  res.status(201).json({
    status: 'success',
    data: { order }
  });
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { orders, total } = await orderService.getOrders(req.user!._id, page, limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.getOrder(req.params.id, req.user!._id);
  
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(req.params.id, req.user!._id, req.body.reason);
  
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const query: any = {};
  if (req.query.status) query.orderStatus = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  if (req.query.startDate && req.query.endDate) {
    query.createdAt = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string)
    };
  }
  
  const { orders, total } = await orderService.getAllOrders(query, page, limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}); 