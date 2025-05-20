import Joi from 'joi';

const addressSchema = Joi.object({
  street: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  state: Joi.string().required().trim(),
  country: Joi.string().required().trim(),
  zipCode: Joi.string().required().trim(),
  phone: Joi.string().required().trim()
});

const orderItemSchema = Joi.object({
  product: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  quantity: Joi.number().required().min(1),
  price: Joi.number().required().min(0),
  lensType: Joi.string().trim(),
  lensColor: Joi.string().trim(),
  power: Joi.object({
    leftEye: Joi.object({
      sphere: Joi.number().min(-20).max(20),
      cylinder: Joi.number().min(-6).max(6),
      axis: Joi.number().min(0).max(180)
    }),
    rightEye: Joi.object({
      sphere: Joi.number().min(-20).max(20),
      cylinder: Joi.number().min(-6).max(6),
      axis: Joi.number().min(0).max(180)
    })
  })
});

export const orderSchema = {
  create: Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    shippingAddress: addressSchema.required(),
    billingAddress: addressSchema.required(),
    paymentMethod: Joi.string().required().valid('credit_card', 'debit_card', 'upi', 'net_banking'),
    shippingMethod: Joi.string().required().valid('standard', 'express', 'next_day'),
    notes: Joi.string().trim()
  }),

  updateStatus: Joi.object({
    status: Joi.string().required().valid(
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ),
    trackingNumber: Joi.string().when('status', {
      is: 'shipped',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  cancel: Joi.object({
    reason: Joi.string().required().trim()
  })
}; 