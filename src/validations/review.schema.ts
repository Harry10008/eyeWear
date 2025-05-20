import Joi from 'joi';

export const reviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5).integer()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'number.integer': 'Rating must be a whole number',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string().required().trim().min(10).max(500)
    .messages({
      'string.empty': 'Comment is required',
      'string.min': 'Comment must be at least 10 characters long',
      'string.max': 'Comment cannot exceed 500 characters'
    })
}); 