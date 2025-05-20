import Joi from 'joi';

const powerSchema = Joi.object({
  sphere: Joi.number()
    .min(-20)
    .max(20)
    .messages({
      'number.base': 'Sphere must be a number',
      'number.min': 'Sphere must be at least -20',
      'number.max': 'Sphere cannot exceed 20'
    }),
  cylinder: Joi.number()
    .min(-6)
    .max(6)
    .messages({
      'number.base': 'Cylinder must be a number',
      'number.min': 'Cylinder must be at least -6',
      'number.max': 'Cylinder cannot exceed 6'
    }),
  axis: Joi.number()
    .min(0)
    .max(180)
    .messages({
      'number.base': 'Axis must be a number',
      'number.min': 'Axis must be at least 0',
      'number.max': 'Axis cannot exceed 180'
    })
});

export const cartItemSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Product ID is required',
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
  lensType: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Lens type cannot be empty'
    }),
  lensColor: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Lens color cannot be empty'
    }),
  power: Joi.object({
    leftEye: powerSchema,
    rightEye: powerSchema
  }).messages({
    'object.base': 'Power must be an object'
  })
});

export const updateCartItemSchema = cartItemSchema.keys({
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required'
    })
}); 