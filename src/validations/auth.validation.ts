import Joi from 'joi';

export const authSchema = {
  register: Joi.object({
    fullName: Joi.string()
      .required()
      .min(2)
      .max(50)
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'any.required': 'Full name is required'
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'string.empty': 'Confirm password is required',
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      }),
    mobileNumber: Joi.string()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.empty': 'Mobile number is required',
        'string.pattern.base': 'Please enter a valid 10-digit mobile number',
        'any.required': 'Mobile number is required'
      }),
    dateOfBirth: Joi.date()
      .required()
      .max('now')
      .messages({
        'date.base': 'Please enter a valid date',
        'date.max': 'Date of birth cannot be in the future',
        'any.required': 'Date of birth is required'
      }),
    gender: Joi.string()
      .required()
      .valid('male', 'female', 'other')
      .messages({
        'string.empty': 'Gender is required',
        'any.only': 'Gender must be male, female, or other',
        'any.required': 'Gender is required'
      }),
    addresses: Joi.array()
      .items(
        Joi.object({
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
          pincode: Joi.string()
            .pattern(/^[0-9]{6}$/)
            .required()
            .messages({
              'string.empty': 'Pincode is required',
              'string.pattern.base': 'Please enter a valid 6-digit pincode',
              'any.required': 'Pincode is required'
            }),
          isDefault: Joi.boolean()
            .default(false)
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one address is required',
        'any.required': 'Addresses are required'
      })
  }),

  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().required().email()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    dateOfBirth: Joi.date().max('now'),
    gender: Joi.string().valid('male', 'female', 'other'),
    addresses: Joi.array().items(
      Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        pincode: Joi.string().required(),
        isDefault: Joi.boolean()
      })
    ),
    profilePicture: Joi.string().uri()
  })
}; 