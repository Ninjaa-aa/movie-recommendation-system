// src/middleware/validation.middleware.js
const { ApiResponse } = require('../utils/apiResponse');

exports.validate = (schema) => {
  return (req, res, next) => {
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
  };
};