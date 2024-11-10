// src/api/v1/users/user.validation.js
const Joi = require('joi');

const userValidation = {
  updateProfile: {
    body: Joi.object({
      name: Joi.string().min(3).max(50),
      email: Joi.string().email(),
      currentPassword: Joi.string().min(6).when('newPassword', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      newPassword: Joi.string().min(6)
    }).min(1)
  },

  updatePreferences: {
    body: Joi.object({
      favoriteGenres: Joi.array().items(Joi.string()),
      favoriteActors: Joi.array().items(Joi.string()),
      preferredLanguages: Joi.array().items(Joi.string()),
      ageRestriction: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17'),
      emailNotifications: Joi.boolean()
    }).min(1)
  }
};

module.exports = userValidation;