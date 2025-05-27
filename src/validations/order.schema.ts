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
  lensDetails: Joi.object({
    type: Joi.string().required().valid('single-vision', 'bifocal', 'progressive')
      .messages({
        'string.empty': 'Lens type is required',
        'any.only': 'Lens type must be one of: single-vision, bifocal, progressive'
      }),
    power: Joi.string().required()
      .messages({
        'string.empty': 'Lens power is required'
      })
  }).required(),
  frameDetails: Joi.object({
    size: Joi.string().required().valid('small', 'medium', 'large')
      .messages({
        'string.empty': 'Frame size is required',
        'any.only': 'Frame size must be one of: small, medium, large'
      }),
    color: Joi.string().required()
      .messages({
        'string.empty': 'Frame color is required'
      })
  }).required()
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