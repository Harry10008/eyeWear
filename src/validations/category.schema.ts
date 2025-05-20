import Joi from 'joi';

export const categorySchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(50)
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 50 characters'
    }),
  slug: Joi.string().trim().lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  description: Joi.string().trim().max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  parent: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid parent category ID format'
    }),
  image: Joi.string().uri()
    .messages({
      'string.uri': 'Image must be a valid URL'
    }),
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0)
    .messages({
      'number.base': 'Order must be a number',
      'number.integer': 'Order must be a whole number',
      'number.min': 'Order cannot be negative'
    })
});

export const categoryOrderSchema = Joi.object({
  categories: Joi.array().items(
    Joi.object({
      id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid category ID format',
          'any.required': 'Category ID is required'
        }),
      order: Joi.number().required().integer().min(0)
        .messages({
          'number.base': 'Order must be a number',
          'number.integer': 'Order must be a whole number',
          'number.min': 'Order cannot be negative',
          'any.required': 'Order is required'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'At least one category must be provided',
      'any.required': 'Categories array is required'
    })
}); 