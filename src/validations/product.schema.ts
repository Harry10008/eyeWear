import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100)
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 3 characters long',
      'string.max': 'Product name cannot exceed 100 characters'
    }),
  description: Joi.string().required().trim().min(10).max(2000)
    .messages({
      'string.empty': 'Product description is required',
      'string.min': 'Product description must be at least 10 characters long',
      'string.max': 'Product description cannot exceed 2000 characters'
    }),
  price: Joi.number().required().min(0)
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  offerPrice: Joi.number().min(0).less(Joi.ref('price'))
    .messages({
      'number.base': 'Offer price must be a number',
      'number.min': 'Offer price cannot be negative',
      'number.less': 'Offer price must be less than regular price'
    }),
  category: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'Category is required',
      'string.pattern.base': 'Invalid category ID format'
    }),
  subCategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid subcategory ID format'
    }),
  brand: Joi.string().required().trim()
    .messages({
      'string.empty': 'Brand is required'
    }),
  gender: Joi.string().required().valid('men', 'women', 'unisex', 'kids')
    .messages({
      'string.empty': 'Gender is required',
      'any.only': 'Gender must be one of: men, women, unisex, kids'
    }),
  type: Joi.string().required().valid('sunglasses', 'screenGlasses', 'powerGlasses')
    .messages({
      'string.empty': 'Type is required',
      'any.only': 'Type must be one of: sunglasses, screenGlasses, powerGlasses'
    }),
  frameMaterial: Joi.string().required().trim()
    .messages({
      'string.empty': 'Frame material is required'
    }),
  frameColor: Joi.string().required().trim()
    .messages({
      'string.empty': 'Frame color is required'
    }),
  lensType: Joi.string().required().trim()
    .messages({
      'string.empty': 'Lens type is required'
    }),
  lensColor: Joi.string().trim(),
  lensWidth: Joi.number().required().min(0)
    .messages({
      'number.base': 'Lens width must be a number',
      'number.min': 'Lens width cannot be negative',
      'any.required': 'Lens width is required'
    }),
  bridgeWidth: Joi.number().required().min(0)
    .messages({
      'number.base': 'Bridge width must be a number',
      'number.min': 'Bridge width cannot be negative',
      'any.required': 'Bridge width is required'
    }),
  templeLength: Joi.number().required().min(0)
    .messages({
      'number.base': 'Temple length must be a number',
      'number.min': 'Temple length cannot be negative',
      'any.required': 'Temple length is required'
    }),
  images: Joi.array().items(Joi.string().uri()).min(1)
    .messages({
      'array.min': 'At least one product image is required',
      'string.uri': 'Image must be a valid URL'
    }),
  stock: Joi.number().required().min(0).integer()
    .messages({
      'number.base': 'Stock must be a number',
      'number.min': 'Stock cannot be negative',
      'number.integer': 'Stock must be a whole number',
      'any.required': 'Stock is required'
    }),
  isActive: Joi.boolean().default(true),
  features: Joi.array().items(Joi.string().trim()),
  specifications: Joi.object({
    material: Joi.string().trim(),
    weight: Joi.number().min(0),
    dimensions: Joi.string().trim(),
    warranty: Joi.string().trim()
  })
}); 