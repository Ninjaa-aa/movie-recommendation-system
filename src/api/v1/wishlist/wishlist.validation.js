// src/api/v1/wishlist/wishlist.validation.js
const Joi = require('joi');

const wishlistValidation = {
  addMovie: {
    body: Joi.object({
      movieId: Joi.string().required(),
      notes: Joi.string().max(500),
      priority: Joi.number().min(1).max(5)
    })
  },

  updateMovie: {
    params: Joi.object({
      movieId: Joi.string().required()
    }),
    body: Joi.object({
      notes: Joi.string().max(500),
      priority: Joi.number().min(1).max(5)
    }).min(1)
  },

  params: {
    params: Joi.object({
      movieId: Joi.string().required()
    })
  }
};

module.exports = wishlistValidation;