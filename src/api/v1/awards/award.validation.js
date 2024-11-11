// src/api/v1/awards/award.validation.js
const Joi = require('joi');

const awardValidation = {
  createAward: {
    body: Joi.object({
      name: Joi.string().required(),
      organization: Joi.string().required(),
      category: Joi.string().required(),
      year: Joi.number()
        .required()
        .min(1900)
        .max(new Date().getFullYear() + 1),
      ceremony: Joi.string().required(),
      isNomination: Joi.boolean(),
      isWinner: Joi.boolean(),
      movie: Joi.string().required(),
      recipients: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          role: Joi.string().required()
        })
      ).min(1).required(),
      description: Joi.string(),
      imageUrl: Joi.string().uri(),
      sourceUrl: Joi.string().uri(),
      presentedBy: Joi.string(),
      acceptedBy: Joi.string(),
      ceremonyDate: Joi.date()
    })
  },

  updateAward: {
    params: Joi.object({
      awardId: Joi.string().required()
    }),
    body: Joi.object({
      name: Joi.string(),
      organization: Joi.string(),
      category: Joi.string(),
      year: Joi.number()
        .min(1900)
        .max(new Date().getFullYear() + 1),
      ceremony: Joi.string(),
      isNomination: Joi.boolean(),
      isWinner: Joi.boolean(),
      recipients: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          role: Joi.string().required()
        })
      ),
      description: Joi.string(),
      imageUrl: Joi.string().uri(),
      sourceUrl: Joi.string().uri(),
      presentedBy: Joi.string(),
      acceptedBy: Joi.string(),
      ceremonyDate: Joi.date()
    }).min(1)
  },

  getMovieAwards: {
    params: Joi.object({
      movieId: Joi.string().required()
    }),
    query: Joi.object({
      isWinner: Joi.boolean(),
      organization: Joi.string(),
      year: Joi.number()
    })
  },

  getAwardsByYear: {
    query: Joi.object({
      year: Joi.number()
        .required()
        .min(1900)
        .max(new Date().getFullYear() + 1),
      organization: Joi.string()
    })
  },

  getAwardWinners: {
    query: Joi.object({
      organization: Joi.string().required(),
      year: Joi.number()
        .required()
        .min(1900)
        .max(new Date().getFullYear() + 1)
    })
  },

  searchAwards: {
    query: Joi.object({
      organization: Joi.string(),
      category: Joi.string(),
      year: Joi.number(),
      isWinner: Joi.boolean(),
      recipient: Joi.string(),
      movie: Joi.string(),
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100)
    })
  },

  deleteAward: {
    params: Joi.object({
      awardId: Joi.string().required()
    })
  }
};

module.exports = awardValidation;