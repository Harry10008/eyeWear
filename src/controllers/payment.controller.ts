import { Request, Response } from 'express';
import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Process payment
export const processPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId, paymentMethod, paymentDetails } = req.body;

  // Get order
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'completed') {
    throw new AppError('Order is already paid', 400);
  }

  // Create payment record
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    amount: order.total,
    currency: 'USD', // TODO: Make this configurable
    paymentMethod,
    paymentDetails,
    paymentGateway: 'stripe', // TODO: Make this configurable
    transactionId: generateTransactionId(),
  });

  try {
    // TODO: Integrate with actual payment gateway
    // For now, simulate payment processing
    await simulatePaymentProcessing();

    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentDetails = {
      transactionId: payment.transactionId,
      paymentGateway: payment.paymentGateway,
      paymentDate: new Date(),
    };
    await order.save();

    // Update payment status
    payment.paymentStatus = 'completed';
    payment.paymentDate = new Date();
    await payment.save();

    res.status(200).json({
      status: 'success',
      data: {
        payment,
        order,
      },
    });
  } catch (error) {
    // Handle payment failure
    payment.paymentStatus = 'failed';
    payment.errorDetails = {
      code: 'PAYMENT_FAILED',
      message: error.message,
    };
    await payment.save();

    throw new AppError('Payment processing failed', 400);
  }
});

// Get payment details
export const getPayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    user: req.user._id,
  }).populate({
    path: 'order',
    select: 'orderStatus total items',
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
    },
  });
});

// Get user's payments
export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'order',
      select: 'orderStatus total items',
    });

  const total = await Payment.countDocuments({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Request refund
export const requestRefund = catchAsync(async (req: Request, res: Response) => {
  const { reason } = req.body;

  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    user: req.user._id,
  }).populate('order');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.paymentStatus !== 'completed') {
    throw new AppError('Only completed payments can be refunded', 400);
  }

  const order = payment.order as any;
  if (order.orderStatus === 'delivered') {
    throw new AppError('Cannot refund delivered orders', 400);
  }

  // TODO: Integrate with actual payment gateway for refund
  // For now, simulate refund processing
  await simulateRefundProcessing();

  // Update payment status
  payment.paymentStatus = 'refunded';
  payment.refundReason = reason;
  payment.refundAmount = payment.amount;
  await payment.save();

  // Update order status
  order.paymentStatus = 'refunded';
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      order,
    },
  });
});

// Admin: Get all payments
export const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  // Filter by status
  if (req.query.status) {
    query.paymentStatus = req.query.status;
  }

  // Filter by payment method
  if (req.query.method) {
    query.paymentMethod = req.query.method;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.paymentDate = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }

  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'order',
      select: 'orderStatus total items',
    });

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Helper functions
function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

async function simulatePaymentProcessing(): Promise<void> {
  // Simulate payment gateway processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() < 0.9) {
        resolve();
      } else {
        reject(new Error('Payment gateway error'));
      }
    }, 2000);
  });
}

async function simulateRefundProcessing(): Promise<void> {
  // Simulate refund processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate
      if (Math.random() < 0.95) {
        resolve();
      } else {
        reject(new Error('Refund processing failed'));
      }
    }, 2000);
  });
} 