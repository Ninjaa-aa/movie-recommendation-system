// src/api/v1/auth/auth.validation.js
const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(6)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  });

const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  });

const nameSchema = Joi.string()
  .required()
  .trim()
  .min(2)
  .max(50)
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  });

const authValidation = {
  register: {
    body: Joi.object({
      email: emailSchema,
      password: passwordSchema,
      name: nameSchema
    }).messages({
      'object.unknown': 'Invalid field in request body'
    })
  },
  login: {
    body: Joi.object({
      email: emailSchema,
      password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      })
    }).messages({
      'object.unknown': 'Invalid field in request body'
    })
  }
};

module.exports = authValidation;

