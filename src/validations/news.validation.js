// src/api/v1/news/news.validation.js
const Joi = require('joi');

const createNews = {
  body: Joi.object({
    title: Joi.string().required().max(200),
    content: Joi.string().required(),
    summary: Joi.string().required().max(300),
    category: Joi.string().required().valid(
      'movie-news',
      'actor-news',
      'industry-updates',
      'upcoming-projects',
      'box-office'
    ),
    tags: Joi.array().items(Joi.string()),
    relatedMovies: Joi.array().items(Joi.string()),
    relatedActors: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required()
    })),
    isHighlighted: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string().valid('true', 'false')
    ),
    source: Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required()
    })
  })
};

const updateNews = {
  params: Joi.object({
    newsId: Joi.string().required()
  }),
  body: Joi.object({
    title: Joi.string().max(200),
    content: Joi.string(),
    summary: Joi.string().max(300),
    category: Joi.string().valid(
      'movie-news',
      'actor-news',
      'industry-updates',
      'upcoming-projects',
      'box-office'
    ),
    tags: Joi.array().items(Joi.string()),
    relatedMovies: Joi.array().items(Joi.string()),
    relatedActors: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required()
    })),
    isHighlighted: Joi.boolean(),
    source: Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri()
    })
  }).min(1)
};

const deleteNews = {
  params: Joi.object({
    newsId: Joi.string().required()
  })
};

const getNews = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(50),
    category: Joi.string().valid(
      'movie-news',
      'actor-news',
      'industry-updates',
      'upcoming-projects',
      'box-office'
    ),
    tag: Joi.string(),
    searchTerm: Joi.string(),
    highlighted: Joi.boolean()
  })
};

const getNewsById = {
  params: Joi.object({
    newsId: Joi.string().required()
  })
};

const getNewsBySlug = {
  params: Joi.object({
    slug: Joi.string().required()
  })
};

const getRelatedNews = {
  params: Joi.object({
    newsId: Joi.string().required()
  }),
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(20)
  })
};

const getTrendingNews = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(20)
  })
};

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  getNews,
  getNewsById,
  getNewsBySlug,
  getRelatedNews,
  getTrendingNews
};