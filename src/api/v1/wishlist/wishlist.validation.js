// src/api/v1/wishlist/wishlist.validation.js
const Joi = require('joi');
const mongoose = require('mongoose');

// Custom Joi validator for ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Object ID Validation');

const wishlistValidation = {
  addMovie: {
    body: Joi.object({
      movieId: objectId.required().messages({
        'any.invalid': 'Invalid movie ID format',
        'any.required': 'Movie ID is required'
      }),
      notes: Joi.string().max(500).allow('', null),
      priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium')
    })
  },

  updateMovie: {
    params: Joi.object({
      movieId: objectId.required().messages({
        'any.invalid': 'Invalid movie ID format',
        'any.required': 'Movie ID is required'
      })
    }),
    body: Joi.object({
      notes: Joi.string().max(500).allow('', null),
      priority: Joi.string().valid('Low', 'Medium', 'High')
    }).min(1)
  },

  params: {
    params: Joi.object({
      movieId: objectId.required().messages({
        'any.invalid': 'Invalid movie ID format',
        'any.required': 'Movie ID is required'
      })
    })
  }
};

module.exports = wishlistValidation;