// src/api/v1/admin/admin.validation.js
const Joi = require('joi');

const adminValidation = {
  getStats: {
    query: Joi.object({
      period: Joi.string()
        .valid('24h', '7d', '30d', '90d')
        .default('30d')
    })
  },

  getModerationQueue: {
    query: Joi.object({
      type: Joi.string()
        .valid('REVIEW', 'FORUM_POST', 'FORUM_TOPIC', 'USER_REPORT'),
      status: Joi.string()
        .valid('PENDING', 'APPROVED', 'REJECTED'),
      moderator: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
    })
  },

  moderateContent: {
    params: Joi.object({
      itemId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      decision: Joi.string()
        .valid('APPROVED', 'REJECTED')
        .required(),
      notes: Joi.string()
        .max(1000)
    })
  }
};