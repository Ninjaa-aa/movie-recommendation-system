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
      'recipients' // Added for awards
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
          // Award related fields
          'recipients',
          'ceremony',
          'presentedBy',
          'acceptedBy',
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
                 'relatedActors', 'keywords', 'recipients'].includes(field)) {
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

        // Special handling for award recipients
        if (req.body.recipients && typeof req.body.recipients === 'string') {
          try {
            req.body.recipients = JSON.parse(req.body.recipients);
            // Ensure each recipient has required fields
            if (Array.isArray(req.body.recipients)) {
              req.body.recipients = req.body.recipients.map(recipient => {
                if (typeof recipient === 'string') {
                  return { name: recipient, role: 'Unspecified' };
                }
                return recipient;
              });
            }
          } catch (e) {
            console.error('Recipients parsing error:', e);
            // If parsing fails, try to create a basic recipient structure
            if (typeof req.body.recipients === 'string') {
              req.body.recipients = [{
                name: req.body.recipients,
                role: 'Unspecified'
              }];
            }
          }
        }

        // Handle dates
        if (req.body.ceremonyDate && typeof req.body.ceremonyDate === 'string') {
          req.body.ceremonyDate = new Date(req.body.ceremonyDate);
        }

        // Convert year to number if it's a string
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

// Keep existing rating and review validation...
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