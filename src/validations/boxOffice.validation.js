// src/api/v1/box-office/boxOffice.validation.js
const Joi = require('joi');

const earningsSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CNY').default('USD')
});

const weeklyEarningsSchema = Joi.object({
  week: Joi.number().integer().min(1).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  domestic: earningsSchema.required(),
  international: earningsSchema.required(),
  worldwide: earningsSchema.required()
});

const boxOfficeValidation = {
  getTopGrossing: {
    query: Joi.object({
      period: Joi.string().valid('all-time', 'week', 'month', 'year').default('all-time'),
      limit: Joi.number().integer().min(1).max(100).default(10)
    })
  },

  createBoxOffice: {
    params: Joi.object({
      movieId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }),
    body: Joi.object({
      openingWeekend: Joi.object({
        domestic: earningsSchema.required(),
        international: earningsSchema.required(),
        worldwide: earningsSchema.required(),
        date: Joi.date().iso().required()
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
      weeklyEarnings: Joi.array().items(weeklyEarningsSchema)
    })
  },

  updateBoxOffice: {
    params: Joi.object({
      movieId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }),
    body: Joi.object({
      totalEarnings: Joi.object({
        domestic: earningsSchema,
        international: earningsSchema,
        worldwide: earningsSchema
      }),
      weeklyEarnings: Joi.array().items(weeklyEarningsSchema)
    }).min(1)
  },

  getBoxOffice: {
    params: Joi.object({
      movieId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    })
  }
};

module.exports = boxOfficeValidation;