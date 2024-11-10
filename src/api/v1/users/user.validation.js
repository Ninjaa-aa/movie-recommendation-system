// src/api/v1/users/user.validation.js
const Joi = require('joi');

const userValidation = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    'profile.bio': Joi.string().max(500),
    'profile.avatar': Joi.string()
  }).min(1),

  updatePreferences: Joi.object({
    genres: Joi.array().items(
      Joi.string().valid(
        'Action', 'Comedy', 'Drama', 'Horror',
        'Sci-Fi', 'Romance', 'Thriller', 'Documentary'
      )
    ),
    actors: Joi.array().items(Joi.string().trim()),
    directors: Joi.array().items(Joi.string().trim())
  }).min(1)
};

module.exports = userValidation;