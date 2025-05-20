import Joi from 'joi';

export const wishlistItemSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Product ID is required',
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    })
}); 