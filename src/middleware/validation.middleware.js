// src/middleware/validation.middleware.js
const { ApiResponse } = require('../utils/apiResponse');

exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse JSON strings in request body
      if (req.body) {
        // Handle arrays
        if (req.body.genre) {
          try {
            req.body.genre = JSON.parse(req.body.genre);
          } catch (e) {
            req.body.genre = [req.body.genre];
          }
        }

        // Handle cast array of objects
        if (req.body.cast) {
          try {
            req.body.cast = JSON.parse(req.body.cast);
          } catch (e) {
            // If parsing fails, assume it's already in correct format
            console.error('Cast parsing error:', e);
          }
        }

        // Handle soundtrack array of objects
        if (req.body.soundtrack) {
          try {
            req.body.soundtrack = JSON.parse(req.body.soundtrack);
          } catch (e) {
            console.error('Soundtrack parsing error:', e);
          }
        }

        // Handle simple arrays
        if (req.body.trivia) {
          try {
            req.body.trivia = JSON.parse(req.body.trivia);
          } catch (e) {
            req.body.trivia = [req.body.trivia];
          }
        }

        if (req.body.goofs) {
          try {
            req.body.goofs = JSON.parse(req.body.goofs);
          } catch (e) {
            req.body.goofs = [req.body.goofs];
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

      next();
    } catch (error) {
      return ApiResponse.error(res, {
        statusCode: 422,
        message: error.message
      });
    }
  };
};