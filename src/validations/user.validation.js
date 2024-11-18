// src/api/v1/users/user.validation.js
const Joi = require('joi');

const userValidation = {
  updateProfile: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).trim(),
      email: Joi.string().email().lowercase().trim(),
      currentPassword: Joi.string().min(6).when('newPassword', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      newPassword: Joi.string().min(6),
      'profile.bio': Joi.string().max(500).trim(),
      'profile.avatar': Joi.string().trim(),
      emailNotifications: Joi.boolean()
    }).min(1)
  },

  updatePreferences: {
    body: Joi.object({
      genres: Joi.array().items(
        Joi.string().valid(
          'Action', 'Comedy', 'Drama', 'Horror', 
          'Sci-Fi', 'Romance', 'Thriller', 'Documentary'
        )
      ),
      addGenres: Joi.array().items(
        Joi.string().valid(
          'Action', 'Comedy', 'Drama', 'Horror', 
          'Sci-Fi', 'Romance', 'Thriller', 'Documentary'
        )
      ),
      removeGenres: Joi.array().items(
        Joi.string().valid(
          'Action', 'Comedy', 'Drama', 'Horror', 
          'Sci-Fi', 'Romance', 'Thriller', 'Documentary'
        )
      ),
      actors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      addActors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      removeActors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      directors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      addDirectors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      removeDirectors: Joi.array().items(
        Joi.string().trim().min(2).max(100)
      ),
      ageRating: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17'),
      emailNotifications: Joi.boolean()
    }).min(1)
  }
};

module.exports = userValidation;