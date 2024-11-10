// src/api/v1/release/release.validation.js
const Joi = require('joi');

const getUpcomingReleases = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    genre: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    period: Joi.string().valid('week', 'month', 'year')
  })
};

const setReminder = {
  body: Joi.object({
    movieId: Joi.string().required(),
    type: Joi.string().valid('release', 'trailer').required()
  })
};

const cancelReminder = {
  params: Joi.object({
    movieId: Joi.string().required(),
    type: Joi.string().valid('release', 'trailer').required()
  })
};

const getUserReminders = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

module.exports = {
  getUpcomingReleases,
  setReminder,
  cancelReminder,
  getUserReminders
};