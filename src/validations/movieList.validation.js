const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Object ID Validation');

const movieListValidation = {
  createList: {
    body: Joi.object({
      title: Joi.string().required().trim().max(100).messages({
        'string.empty': 'Title is required',
        'string.max': 'Title cannot be longer than 100 characters'
      }),
      description: Joi.string().trim().max(500).allow('', null).messages({
        'string.max': 'Description cannot be longer than 500 characters'
      }),
      isPublic: Joi.boolean().default(true),
      tags: Joi.array().items(Joi.string().trim()).max(10).messages({
        'array.max': 'Cannot add more than 10 tags'
      })
    })
  },

  updateList: {
    body: Joi.object({
      title: Joi.string().trim().max(100).messages({
        'string.max': 'Title cannot be longer than 100 characters'
      }),
      description: Joi.string().trim().max(500).allow('', null).messages({
        'string.max': 'Description cannot be longer than 500 characters'
      }),
      isPublic: Joi.boolean(),
      tags: Joi.array().items(Joi.string().trim()).max(10).messages({
        'array.max': 'Cannot add more than 10 tags'
      })
    }).min(1)
  },

  addMovie: {
    params: Joi.object({
      listId: objectId.required().messages({
        'any.invalid': 'Invalid list ID format',
        'any.required': 'List ID is required'
      })
    }),
    body: Joi.object({
      movieId: objectId.required().messages({
        'any.invalid': 'Invalid movie ID format',
        'any.required': 'Movie ID is required'
      }),
      notes: Joi.string().max(500).allow('', null).messages({
        'string.max': 'Notes cannot be longer than 500 characters'
      })
    })
  },

  removeMovie: {
    params: Joi.object({
      listId: objectId.required().messages({
        'any.invalid': 'Invalid list ID format',
        'any.required': 'List ID is required'
      }),
      movieId: objectId.required().messages({
        'any.invalid': 'Invalid movie ID format',
        'any.required': 'Movie ID is required'
      })
    })
  },

  getUserLists: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be greater than 0'
      }),
      limit: Joi.number().integer().min(1).max(50).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be greater than 0',
        'number.max': 'Limit cannot exceed 50'
      })
    })
  },

  getPublicLists: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be greater than 0'
      }),
      limit: Joi.number().integer().min(1).max(50).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be greater than 0',
        'number.max': 'Limit cannot exceed 50'
      }),
      tags: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
      )
    })
  },

  listId: {
    params: Joi.object({
      listId: objectId.required().messages({
        'any.invalid': 'Invalid list ID format',
        'any.required': 'List ID is required'
      })
    })
  }
};

module.exports = movieListValidation;