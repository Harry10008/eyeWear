import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 50 characters',
      'any.required': 'Full name is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),
  mobileNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Please enter a valid 10-digit mobile number',
      'any.required': 'Mobile number is required'
    }),
  dateOfBirth: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Please enter a valid date',
      'date.format': 'Please enter a valid date in ISO format',
      'any.required': 'Date of birth is required'
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .required()
    .messages({
      'string.empty': 'Gender is required',
      'any.only': 'Gender must be male, female, or other',
      'any.required': 'Gender is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  addresses: Joi.array()
    .items(
      Joi.object({
        street: Joi.string().required().messages({
          'string.empty': 'Street address is required',
          'any.required': 'Street address is required'
        }),
        city: Joi.string().required().messages({
          'string.empty': 'City is required',
          'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
          'string.empty': 'State is required',
          'any.required': 'State is required'
        }),
        country: Joi.string().required().messages({
          'string.empty': 'Country is required',
          'any.required': 'Country is required'
        }),
        pincode: Joi.string()
          .pattern(/^[0-9]{6}$/)
          .required()
          .messages({
            'string.empty': 'Pincode is required',
            'string.pattern.base': 'Please enter a valid 6-digit pincode',
            'any.required': 'Pincode is required'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one address is required',
      'any.required': 'Addresses are required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    })
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
}); 