// src/api/v1/community/validation.js
const Joi = require('joi');

const urlPattern = /^https?:\/\/.+/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const communityValidation = {
  // Forum Validations
  createForum: {
    body: Joi.object({
      name: Joi.string().trim().min(3).max(100).required(),
      description: Joi.string().trim().min(10).max(500).required(),
      category: Joi.string().valid('MOVIES', 'ACTORS', 'DIRECTORS', 'GENRES', 'GENERAL').required(),
      movie: Joi.string().pattern(objectIdPattern)
        .when('category', {
          is: 'MOVIES',
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
      moderators: Joi.array().items(
        Joi.string().pattern(objectIdPattern)
      )
    })
  },

  updateForum: {
    params: Joi.object({
      forumId: Joi.string().pattern(objectIdPattern).required()
    }),
    body: Joi.object({
      name: Joi.string().trim().min(3).max(100),
      description: Joi.string().trim().min(10).max(500),
      moderators: Joi.array().items(
        Joi.string().pattern(objectIdPattern)
      ),
      isActive: Joi.boolean()
    }).min(1)
  },

  // Topic Validations
  createTopic: {
    params: Joi.object({
      forumId: Joi.string().pattern(objectIdPattern).required()
    }),
    body: Joi.object({
      title: Joi.string().trim().min(5).max(200).required(),
      content: Joi.string().trim().min(20).max(10000).required(),
      tags: Joi.array().items(
        Joi.string().trim().min(2).max(30)
      ).max(5)
    })
  },

  updateTopic: {
    params: Joi.object({
      topicId: Joi.string().pattern(objectIdPattern).required()
    }),
    body: Joi.object({
      title: Joi.string().trim().min(5).max(200),
      content: Joi.string().trim().min(20).max(10000),
      tags: Joi.array().items(
        Joi.string().trim().min(2).max(30)
      ).max(5),
      isPinned: Joi.boolean(),
      isLocked: Joi.boolean(),
      isActive: Joi.boolean()
    }).min(1)
  },

  // Post Validations
  createPost: {
    params: Joi.object({
      topicId: Joi.string().pattern(objectIdPattern).required()
    }),
    body: Joi.object({
      content: Joi.string().trim().min(1).max(10000).required(),
      parentPost: Joi.string().pattern(objectIdPattern),
      mentions: Joi.array().items(
        Joi.string().pattern(objectIdPattern)
      ),
      attachments: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('IMAGE', 'VIDEO', 'LINK').required(),
          url: Joi.string().pattern(urlPattern).required(),
          caption: Joi.string().trim().max(200)
        })
      ).max(5)
    })
  },

  updatePost: {
    params: Joi.object({
      postId: Joi.string().pattern(objectIdPattern).required()
    }),
    body: Joi.object({
      content: Joi.string().trim().min(1).max(10000).required(),
      attachments: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('IMAGE', 'VIDEO', 'LINK').required(),
          url: Joi.string().pattern(urlPattern).required(),
          caption: Joi.string().trim().max(200)
        })
      ).max(5)
    })
  },

  // List and Search Validations
  listForums: {
    query: Joi.object({
      category: Joi.string().valid('MOVIES', 'ACTORS', 'DIRECTORS', 'GENRES', 'GENERAL'),
      movie: Joi.string().pattern(objectIdPattern),
      search: Joi.string().trim().min(3).max(100),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  listTopics: {
    params: Joi.object({
      forumId: Joi.string().pattern(objectIdPattern).required()
    }),
    query: Joi.object({
      search: Joi.string().trim().min(3).max(100),
      tags: Joi.array().items(
        Joi.string().trim().min(2).max(30)
      ),
      author: Joi.string().pattern(objectIdPattern),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  listPosts: {
    params: Joi.object({
      topicId: Joi.string().pattern(objectIdPattern).required()
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  }
};

module.exports = communityValidation;