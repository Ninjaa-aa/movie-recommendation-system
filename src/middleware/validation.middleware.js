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
    if (['genre', 'trivia', 'goofs', 'tags', 'relatedMovies', 'relatedActors'].includes(field)) {
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
          // Movie related fields
          'genre', 
          'cast', 
          'soundtrack', 
          'trivia', 
          'goofs',
          // Additional fields
          'tags', 
          'relatedMovies', 
          'relatedActors', 
          'source',
          // Any other array or object fields
          'keywords',
          'awards',
          'preferences'
        ];
        
        fieldsToHandle.forEach(field => {
          if (req.body[field]) {
            req.body[field] = parseField(req.body[field], field);
            
            // Ensure arrays for specific fields even after parsing
            if (!Array.isArray(req.body[field]) && 
                ['genre', 'trivia', 'goofs', 'tags', 'relatedMovies', 
                 'relatedActors', 'keywords'].includes(field)) {
              req.body[field] = [req.body[field]];
            }
          }
        });

        // Special handling for nested fields
        if (req.body.cast && typeof req.body.cast === 'string') {
          try {
            req.body.cast = JSON.parse(req.body.cast);
          } catch (e) {
            console.error('Cast parsing error:', e);
          }
        }

        if (req.body.soundtrack && typeof req.body.soundtrack === 'string') {
          try {
            req.body.soundtrack = JSON.parse(req.body.soundtrack);
          } catch (e) {
            console.error('Soundtrack parsing error:', e);
          }
        }
      }

      // Validate request parts
      const validationErrors = [];

      if (schema.params) {
        const { error } = schema.params.validate(req.params);
        if (error) validationErrors.push(error);
      }

      if (schema.query) {
        const { error } = schema.query.validate(req.query);
        if (error) validationErrors.push(error);
      }

      if (schema.body) {
        const { error } = schema.body.validate(req.body);
        if (error) validationErrors.push(error);
      }

      if (validationErrors.length > 0) {
        const errorMessage = validationErrors
          .map(error => error.details.map(detail => detail.message))
          .flat()
          .join(', ');

        return ApiResponse.error(res, {
          statusCode: 422,
          message: errorMessage
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
        message: error.message
      });
    }
  };
};

// Specific validation for ratings
exports.validateRating = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500) // Optional comment with rating
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};

// Enhanced review validation
exports.validateReview = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(10).max(1000).required(),
    title: Joi.string().max(100), // Optional review title
    tags: Joi.array().items(Joi.string()), // Optional tags
    spoilerAlert: Joi.boolean().default(false), // Spoiler warning
    recommendation: Joi.string().valid('recommend', 'neutral', 'not_recommend')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};