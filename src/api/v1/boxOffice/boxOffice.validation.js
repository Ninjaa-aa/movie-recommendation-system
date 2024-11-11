// src/api/v1/boxOffice/boxOffice.validation.js
const Joi = require('joi');

const earningsSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  currency: Joi.string().default('USD')
});

const createBoxOffice = {
  params: Joi.object({
    movieId: Joi.string().required()
  }),
  body: Joi.object({
    openingWeekend: Joi.object({
      domestic: earningsSchema,
      international: earningsSchema,
      worldwide: earningsSchema,
      date: Joi.date().required()
    }).required(),
    totalEarnings: Joi.object({
      domestic: earningsSchema,
      international: earningsSchema,
      worldwide: earningsSchema
    }),
    budget: Joi.object({
      production: earningsSchema,
      marketing: earningsSchema
    }),
    weeklyEarnings: Joi.array().items(
      Joi.object({
        week: Joi.number().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        domestic: earningsSchema,
        international: earningsSchema,
        worldwide: earningsSchema
      })
    )
  })
};

const updateBoxOffice = {
  params: Joi.object({
    movieId: Joi.string().required()
  }),
  body: Joi.object({
    totalEarnings: Joi.object({
      domestic: earningsSchema,
      international: earningsSchema,
      worldwide: earningsSchema
    }),
    weeklyEarnings: Joi.array().items(
      Joi.object({
        week: Joi.number().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        domestic: earningsSchema,
        international: earningsSchema,
        worldwide: earningsSchema
      })
    )
  }).min(1)
};

const getBoxOfficeByMovie = {
  params: Joi.object({
    movieId: Joi.string().required()
  })
};

const getTopGrossing = {
  query: Joi.object({
    period: Joi.string().valid('all-time', 'week', 'month', 'year'),
    limit: Joi.number().integer().min(1).max(100)
  })
};

module.exports = {
  createBoxOffice,
  updateBoxOffice,
  getBoxOfficeByMovie,
  getTopGrossing
};