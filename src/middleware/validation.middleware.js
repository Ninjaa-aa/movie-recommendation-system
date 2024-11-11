const Joi = require('joi');
const { ApiResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

// Utility function to handle array and object parsing
const parseField = (value, field) => {
  if (typeof value !== 'string') return value;
  
  try {
    // Try to parse if it looks like JSON
    if (value.startsWith('[') || value.startsWith('{')) {
      return JSON.parse(value);
    }
  } catch (e) {
    // If parsing fails, handle based on field type
    if ([
      'genre', 'trivia', 'goofs', 'tags', 'relatedMovies', 'relatedActors',
      'recipients'
    ].includes(field)) {
      // For simple arrays, split by comma if it contains commas
      if (value.includes(',')) {
        return value.split(',').map(item => item.trim());
      } 
      // Single value becomes an array with one item
      return [value];
    }
  }
  return value;
};

// Generic validation middleware
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse JSON strings in request body
      if (req.body) {
        const fieldsToHandle = [
          'genre', 'cast', 'soundtrack', 'trivia', 'goofs',
          'tags', 'relatedMovies', 'relatedActors', 'source',
          'recipients', 'ceremony', 'presentedBy', 'acceptedBy',
          'keywords', 'awards', 'preferences'
        ];
        
        fieldsToHandle.forEach(field => {
          if (req.body[field]) {
            req.body[field] = parseField(req.body[field], field);
            
            if (!Array.isArray(req.body[field]) && 
                ['genre', 'trivia', 'goofs', 'tags', 'relatedMovies', 
                 'relatedActors', 'keywords', 'recipients'].includes(field)) {
              req.body[field] = [req.body[field]];
            }
          }
        });

        // Handle special cases
        if (req.body.cast && typeof req.body.cast === 'string') {
          try {
            req.body.cast = JSON.parse(req.body.cast);
          } catch (e) {
            console.error('Cast parsing error:', e);
          }
        }

        if (req.body.recipients && typeof req.body.recipients === 'string') {
          try {
            req.body.recipients = JSON.parse(req.body.recipients);
            if (Array.isArray(req.body.recipients)) {
              req.body.recipients = req.body.recipients.map(recipient => {
                return typeof recipient === 'string' 
                  ? { name: recipient, role: 'Unspecified' }
                  : recipient;
              });
            }
          } catch (e) {
            console.error('Recipients parsing error:', e);
            if (typeof req.body.recipients === 'string') {
              req.body.recipients = [{
                name: req.body.recipients,
                role: 'Unspecified'
              }];
            }
          }
        }

        // Handle dates and numbers
        if (req.body.ceremonyDate && typeof req.body.ceremonyDate === 'string') {
          req.body.ceremonyDate = new Date(req.body.ceremonyDate);
        }

        if (req.body.year && typeof req.body.year === 'string') {
          req.body.year = parseInt(req.body.year, 10);
        }

        // Convert boolean fields
        ['isWinner', 'isNomination', 'isActive'].forEach(field => {
          if (req.body[field] !== undefined) {
            if (typeof req.body[field] === 'string') {
              req.body[field] = req.body[field].toLowerCase() === 'true';
            }
          }
        });
      }

      // Validate request parts
      const validationErrors = [];

      // Only validate parts that exist in the schema
      if (schema.params && Object.keys(req.params || {}).length > 0) {
        const { error } = schema.params.validate(req.params);
        if (error) validationErrors.push(error);
      }

      if (schema.query && Object.keys(req.query || {}).length > 0) {
        const { error } = schema.query.validate(req.query);
        if (error) validationErrors.push(error);
      }

      if (schema.body && Object.keys(req.body || {}).length > 0) {
        const { error } = schema.body.validate(req.body);
        if (error) validationErrors.push(error);
      }

      if (validationErrors.length > 0) {
        return ApiResponse.error(res, {
          statusCode: 422,
          message: validationErrors
            .map(error => error.details.map(detail => detail.message))
            .flat()
            .join(', ')
        });
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Validated request body:', req.body);
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return ApiResponse.error(res, {
        statusCode: 422,
        message: 'Validation failed: ' + error.message
      });
    }
  };
};

// Wishlist validation schemas
exports.wishlistValidation = {
  addToWishlist: {
    body: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format',
          'any.required': 'Movie ID is required'
        }),
      priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .default('Medium'),
      notes: Joi.string()
        .max(500)
        .allow('', null)
    })
  },
  
  updateWishlistItem: {  // New schema for PUT request
    params: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format',
          'any.required': 'Movie ID is required'
        })
    }),
    body: Joi.object({
      priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .required(),
      notes: Joi.string()
        .max(500)
        .allow('', null)
        .required()
    })
  },

  updateNotes: {
    params: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format',
          'any.required': 'Movie ID is required'
        })
    }),
    body: Joi.object({
      priority: Joi.string()
        .valid('Low', 'Medium', 'High'),
      notes: Joi.string()
        .max(500)
        .allow('', null)
    }).min(1)
  },

  removeFromWishlist: {
    params: Joi.object({
      movieId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Invalid movie ID format',
          'any.required': 'Movie ID is required'
        })
    })
  }
};

// Rating validation
exports.validateRating = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};

// Review validation
exports.validateReview = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(10).max(1000).required(),
    title: Joi.string().max(100),
    tags: Joi.array().items(Joi.string()),
    spoilerAlert: Joi.boolean().default(false),
    recommendation: Joi.string().valid('recommend', 'neutral', 'not_recommend')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};