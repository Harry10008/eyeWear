import { Request, Response } from 'express';
import { Order } from '../models/order.model';
import { Cart, ICartItem } from '../models/cart.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Create order from cart
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod,
    notes,
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Calculate order totals
  const subtotal = cart.totalAmount;
  const shippingCost = calculateShippingCost(shippingMethod, subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + shippingCost + tax;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((item: ICartItem) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      lensType: item.lensType,
      lensColor: item.lensColor,
      power: item.power,
    })),
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod,
    shippingCost,
    subtotal,
    tax,
    total,
    notes,
    estimatedDeliveryDate: calculateEstimatedDeliveryDate(shippingMethod),
  });

  // Clear cart after successful order creation
  cart.items = [];
  cart.totalItems = 0;
  cart.totalAmount = 0;
  await cart.save();

  // Populate order details
  await order.populate({
    path: 'items.product',
    select: 'name description price images brand',
  });

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Get user's orders
export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'items.product',
      select: 'name description price images brand',
    });

  const total = await Order.countDocuments({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get single order
export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  }).populate({
    path: 'items.product',
    select: 'name description price images brand',
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Cancel order
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.orderStatus !== 'pending') {
    throw new AppError('Order cannot be cancelled', 400);
  }

  order.orderStatus = 'cancelled';
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Admin: Get all orders
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  // Filter by status
  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.createdAt = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }

  const orders = await Order.find(query)
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
    });

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Admin: Update order status
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderStatus, shippingStatus, trackingNumber } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
  }
  if (shippingStatus) {
    order.shippingStatus = shippingStatus;
  }
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Admin: Update payment status
export const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentStatus, paymentDetails } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.paymentStatus = paymentStatus;
  if (paymentDetails) {
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      paymentDate: new Date(),
    };
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Helper functions
function calculateShippingCost(method: string, subtotal: number): number {
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

function calculateTax(subtotal: number): number {
  return subtotal * 0.1; // 10% tax
}

function calculateEstimatedDeliveryDate(method: string): Date {
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