// src/api/v1/wishlist/wishlist.validation.js
const Joi = require('joi');

const wishlistValidation = {
  addMovie: Joi.object({
    movieId: Joi.string().required(),
    title: Joi.string().required(),
    notes: Joi.string().max(500),
    priority: Joi.string().valid('Low', 'Medium', 'High')
  }),

  // For URL params validation
  params: Joi.object({
    movieId: Joi.string().required()
  }),

  updateMovie: Joi.object({
    notes: Joi.string().max(500),
    priority: Joi.string().valid('Low', 'Medium', 'High')
  }).min(1) // At least one field must be provided
};

module.exports = wishlistValidation;