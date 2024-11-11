// src/api/v1/community/community.validation.js
const Joi = require('joi');

const communityValidation = {
  // Forum Validations
  createForum: {
    body: Joi.object({
      name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
          'string.min': 'Forum name must be at least 3 characters long',
          'string.max': 'Forum name cannot exceed 100 characters',
          'any.required': 'Forum name is required'
        }),
      description: Joi.string()
        .required()
        .max(500)
        .messages({
          'string.max': 'Description cannot exceed 500 characters',
          'any.required': 'Forum description is required'
        }),
      category: Joi.string()
        .required()
        .valid('MOVIES', 'TV_SHOWS', 'GENERAL', 'NEWS', 'REVIEWS')
        .messages({
          'any.required': 'Forum category is required',
          'any.only': 'Invalid forum category'
        }),
      movie: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format'
        }),
      moderators: Joi.array()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .messages({
              'string.pattern.base': 'Invalid moderator ID format'
            })
        )
        .min(1)
        .messages({
          'array.min': 'At least one moderator is required'
        })
    })
  },

  updateForum: {
    params: Joi.object({
      forumId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid forum ID format',
          'any.required': 'Forum ID is required'
        })
    }),
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(100),
      description: Joi.string()
        .max(500),
      category: Joi.string()
        .valid('MOVIES', 'TV_SHOWS', 'GENERAL', 'NEWS', 'REVIEWS'),
      moderators: Joi.array()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
        )
        .min(1)
    }).min(1)
  },

  getForum: {
    params: Joi.object({
      forumId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid forum ID format',
          'any.required': 'Forum ID is required'
        })
    })
  },

  listForums: {
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      category: Joi.string().valid('MOVIES', 'TV_SHOWS', 'GENERAL', 'NEWS', 'REVIEWS'),
      movie: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      search: Joi.string().min(2).max(100)
    })
  },

  deleteForum: {
    params: Joi.object({
      forumId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid forum ID format',
          'any.required': 'Forum ID is required'
        })
    })
  },

  // Topic Validations
  createTopic: {
    params: Joi.object({
      forumId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    body: Joi.object({
      title: Joi.string()
        .required()
        .min(5)
        .max(200),
      content: Joi.string()
        .required()
        .min(10)
        .max(5000),
      tags: Joi.array()
        .items(Joi.string().max(30))
        .max(5)
    })
  },

  updateTopic: {
    params: Joi.object({
      topicId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    body: Joi.object({
      title: Joi.string()
        .min(5)
        .max(200),
      content: Joi.string()
        .min(10)
        .max(5000),
      tags: Joi.array()
        .items(Joi.string().max(30))
        .max(5)
    }).min(1)
  },

  listTopics: {
    params: Joi.object({
      forumId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      sort: Joi.string().valid('newest', 'popular', 'active').default('newest')
    })
  },

  // Post Validations
  createPost: {
    params: Joi.object({
      topicId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    body: Joi.object({
      content: Joi.string()
        .required()
        .min(1)
        .max(5000)
    })
  },

  updatePost: {
    params: Joi.object({
      postId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    body: Joi.object({
      content: Joi.string()
        .required()
        .min(1)
        .max(5000)
    })
  },

  listPosts: {
    params: Joi.object({
      topicId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
    }),
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      sort: Joi.string().valid('newest', 'popular').default('newest')
    })
  }
};

module.exports = communityValidation;