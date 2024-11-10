// src/middleware/validation.middleware.js
const Joi = require('joi');
const { ApiResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

// Generic validation middleware
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse JSON strings in request body
      if (req.body) {
        const fieldsToHandle = ['genre', 'cast', 'soundtrack', 'trivia', 'goofs'];
        
        fieldsToHandle.forEach(field => {
          if (req.body[field]) {
            // Check if the field is already an array or object
            if (typeof req.body[field] === 'string') {
              try {
                // Try to parse if it looks like JSON
                if (req.body[field].startsWith('[') || req.body[field].startsWith('{')) {
                  req.body[field] = JSON.parse(req.body[field]);
                }
              } catch (e) {
                // If parsing fails, handle based on field type
                if (['genre', 'trivia', 'goofs'].includes(field)) {
                  // For simple arrays, split by comma if it contains commas
                  if (req.body[field].includes(',')) {
                    req.body[field] = req.body[field].split(',').map(item => item.trim());
                  } else {
                    // Single value becomes an array with one item
                    req.body[field] = [req.body[field]];
                  }
                }
              }
            }

            // Ensure arrays for specific fields
            if (!Array.isArray(req.body[field]) && ['genre', 'trivia', 'goofs'].includes(field)) {
              req.body[field] = [req.body[field]];
            }
          }
        });
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

      next();
    } catch (error) {
      return ApiResponse.error(res, {
        statusCode: 422,
        message: error.message
      });
    }
  };
};

// Specific validation middlewares for ratings and reviews
exports.validateRating = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};

exports.validateReview = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(10).max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  next();
};