// src/api/v1/wishlist/wishlist.validation.js
const Joi = require('joi');

const wishlistValidation = {
  addToWishlist: {
    body: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format',
          'any.required': 'Movie ID is required'
        }),
      priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .default('Medium'),
      notes: Joi.string()
        .max(500)
        .allow('', null)
    })
  },
  updateNotes: {
    params: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format'
        })
    }),
    body: Joi.object({
      priority: Joi.string()
        .valid('Low', 'Medium', 'High'),
      notes: Joi.string()
        .max(500)
        .allow('', null)
    }).min(1)
  }
};

module.exports = wishlistValidation;