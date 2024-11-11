// src/api/v1/awards/award.validation.js
const Joi = require('joi');

const createAward = {
  body: Joi.object({
    name: Joi.string().required(),
    organization: Joi.string().required(),
    category: Joi.string().required(),
    year: Joi.number().required().min(1900).max(new Date().getFullYear() + 1),
    ceremony: Joi.string().required(),
    isNomination: Joi.boolean(),
    isWinner: Joi.boolean(),
    movie: Joi.string(),
    recipients: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required()
    })).required(),
    description: Joi.string(),
    imageUrl: Joi.string().uri(),
    sourceUrl: Joi.string().uri()
  })
};

const updateAward = {
  params: Joi.object({
    awardId: Joi.string().required()
  }),
  body: Joi.object({
    name: Joi.string(),
    organization: Joi.string(),
    category: Joi.string(),
    year: Joi.number().min(1900).max(new Date().getFullYear() + 1),
    ceremony: Joi.string(),
    isNomination: Joi.boolean(),
    isWinner: Joi.boolean(),
    movie: Joi.string(),
    recipients: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required()
    })),
    description: Joi.string(),
    imageUrl: Joi.string().uri(),
    sourceUrl: Joi.string().uri()
  }).min(1)
};

const getMovieAwards = {
  params: Joi.object({
    movieId: Joi.string().required()
  })
};

const getAwardsByYear = {
  query: Joi.object({
    year: Joi.number().required().min(1900).max(new Date().getFullYear() + 1),
    organization: Joi.string()
  })
};

const getAwardWinners = {
  query: Joi.object({
    organization: Joi.string().required(),
    year: Joi.number().required().min(1900).max(new Date().getFullYear() + 1)
  })
};

const searchAwards = {
  query: Joi.object({
    organization: Joi.string(),
    category: Joi.string(),
    year: Joi.number().min(1900).max(new Date().getFullYear() + 1),
    isWinner: Joi.boolean(),
    recipient: Joi.string(),
    movie: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

module.exports = {
  createAward,
  updateAward,
  getMovieAwards,
  getAwardsByYear,
  getAwardWinners,
  searchAwards
};