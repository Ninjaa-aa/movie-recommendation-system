// src/validations/admin.validation.js
const Joi = require('joi');

const adminValidation = {
  moderateReview: {
    params: Joi.object().keys({  // Add explicit schema for params
      reviewId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)  // Validate MongoDB ObjectId format
        .messages({
          'string.pattern.base': 'Invalid review ID format'
        })
    }),
    body: Joi.object().keys({  // Add explicit schema for body
      action: Joi.string()
        .required()
        .valid('approve', 'reject', 'remove')
        .messages({
          'any.only': 'Action must be either approve, reject, or remove'
        }),
      reason: Joi.string()
        .when('action', {
          is: Joi.string().valid('reject', 'remove'),
          then: Joi.string().required(),
          otherwise: Joi.string().optional()
        })
        .messages({
          'any.required': 'Reason is required when rejecting or removing a review'
        })
    })
  },

  getStatistics: {
    query: Joi.object().keys({  // Add explicit schema for query
      timeframe: Joi.string()
        .valid('24h', '7d', '30d', 'all')
        .default('7d')
        .messages({
          'any.only': 'Timeframe must be one of: 24h, 7d, 30d, all'
        })
    })
  }
};

module.exports = adminValidation;