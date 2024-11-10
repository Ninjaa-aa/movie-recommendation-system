// src/api/v1/search/search.validation.js
const Joi = require('joi');

const searchMovies = {
  query: Joi.object().keys({
    searchTerm: Joi.string().min(2),
    title: Joi.string(),
    genre: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    director: Joi.string(),
    actor: Joi.string(),
    minRating: Joi.number().min(0).max(5),
    maxRating: Joi.number().min(0).max(5),
    minPopularity: Joi.number().min(0),
    releaseYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    decade: Joi.number().integer().min(1900).max(new Date().getFullYear() - (new Date().getFullYear() % 10)),
    fromDate: Joi.date(),
    toDate: Joi.date().min(Joi.ref('fromDate')),
    country: Joi.string(),
    language: Joi.string(),
    keywords: Joi.string(),
    ageRating: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    sortBy: Joi.string().valid('releaseDate', 'rating', 'popularity', 'title', 'mostViewed'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

const getTopMovies = {
  query: Joi.object().keys({
    period: Joi.string().valid('week', 'month', 'year', 'all_time'),
    genre: Joi.string(),
    type: Joi.string().valid('rating', 'popular', 'trending'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

module.exports = {
  searchMovies,
  getTopMovies
};