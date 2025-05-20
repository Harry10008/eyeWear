import Joi from 'joi';

export const addressSchema = Joi.object({
  street: Joi.string()
    .required()
    .messages({
      'string.empty': 'Street address is required',
      'any.required': 'Street address is required'
    }),
  city: Joi.string()
    .required()
    .messages({
      'string.empty': 'City is required',
      'any.required': 'City is required'
    }),
  state: Joi.string()
    .required()
    .messages({
      'string.empty': 'State is required',
      'any.required': 'State is required'
    }),
  country: Joi.string()
    .required()
    .messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required'
    }),
  zipCode: Joi.string()
    .required()
    .messages({
      'string.empty': 'ZIP code is required',
      'any.required': 'ZIP code is required'
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Invalid phone number format',
      'any.required': 'Phone number is required'
    })
});

export const createOrderSchema = Joi.object({
  shippingAddress: addressSchema.required().messages({
    'any.required': 'Shipping address is required'
  }),
  billingAddress: addressSchema.required().messages({
    'any.required': 'Billing address is required'
  }),
  paymentMethod: Joi.string()
    .valid('credit_card', 'debit_card', 'upi', 'net_banking')
    .required()
    .messages({
      'string.empty': 'Payment method is required',
      'any.only': 'Invalid payment method',
      'any.required': 'Payment method is required'
    }),
  paymentDetails: Joi.object({
    cardNumber: Joi.string()
      .when('paymentMethod', {
        is: Joi.string().valid('credit_card', 'debit_card'),
        then: Joi.string().required().messages({
          'string.empty': 'Card number is required',
          'any.required': 'Card number is required'
        }),
        otherwise: Joi.forbidden()
      }),
    cardType: Joi.string()
      .when('paymentMethod', {
        is: Joi.string().valid('credit_card', 'debit_card'),
        then: Joi.string().required().messages({
          'string.empty': 'Card type is required',
          'any.required': 'Card type is required'
        }),
        otherwise: Joi.forbidden()
      }),
    cardHolderName: Joi.string()
      .when('paymentMethod', {
        is: Joi.string().valid('credit_card', 'debit_card'),
        then: Joi.string().required().messages({
          'string.empty': 'Card holder name is required',
          'any.required': 'Card holder name is required'
        }),
        otherwise: Joi.forbidden()
      }),
    expiryDate: Joi.string()
      .when('paymentMethod', {
        is: Joi.string().valid('credit_card', 'debit_card'),
        then: Joi.string().required().messages({
          'string.empty': 'Expiry date is required',
          'any.required': 'Expiry date is required'
        }),
        otherwise: Joi.forbidden()
      }),
    upiId: Joi.string()
      .when('paymentMethod', {
        is: 'upi',
        then: Joi.string().required().messages({
          'string.empty': 'UPI ID is required',
          'any.required': 'UPI ID is required'
        }),
        otherwise: Joi.forbidden()
      }),
    bankName: Joi.string()
      .when('paymentMethod', {
        is: 'net_banking',
        then: Joi.string().required().messages({
          'string.empty': 'Bank name is required',
          'any.required': 'Bank name is required'
        }),
        otherwise: Joi.forbidden()
      }),
    accountNumber: Joi.string()
      .when('paymentMethod', {
        is: 'net_banking',
        then: Joi.string().required().messages({
          'string.empty': 'Account number is required',
          'any.required': 'Account number is required'
        }),
        otherwise: Joi.forbidden()
      }),
    ifscCode: Joi.string()
      .when('paymentMethod', {
        is: 'net_banking',
        then: Joi.string().required().messages({
          'string.empty': 'IFSC code is required',
          'any.required': 'IFSC code is required'
        }),
        otherwise: Joi.forbidden()
      })
  }).required().messages({
    'any.required': 'Payment details are required'
  })
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'string.empty': 'Order status is required',
      'any.only': 'Invalid order status',
      'any.required': 'Order status is required'
    }),
  trackingNumber: Joi.string()
    .when('status', {
      is: 'shipped',
      then: Joi.string().required().messages({
        'string.empty': 'Tracking number is required',
        'any.required': 'Tracking number is required'
      }),
      otherwise: Joi.string().allow('')
    }),
  estimatedDeliveryDate: Joi.date()
    .when('status', {
      is: 'shipped',
      then: Joi.date().required().messages({
        'date.base': 'Invalid delivery date',
        'any.required': 'Estimated delivery date is required'
      }),
      otherwise: Joi.date().allow(null)
    })
});

export const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid('pending', 'completed', 'failed', 'refunded')
    .required()
    .messages({
      'string.empty': 'Payment status is required',
      'any.only': 'Invalid payment status',
      'any.required': 'Payment status is required'
    }),
  paymentDetails: Joi.object({
    transactionId: Joi.string()
      .when('paymentStatus', {
        is: Joi.string().valid('completed', 'refunded'),
        then: Joi.string().required().messages({
          'string.empty': 'Transaction ID is required',
          'any.required': 'Transaction ID is required'
        }),
        otherwise: Joi.string().allow('')
      }),
    paymentGateway: Joi.string()
      .when('paymentStatus', {
        is: Joi.string().valid('completed', 'refunded'),
        then: Joi.string().required().messages({
          'string.empty': 'Payment gateway is required',
          'any.required': 'Payment gateway is required'
        }),
        otherwise: Joi.string().allow('')
      })
  }).required().messages({
    'any.required': 'Payment details are required'
  })
}); 