// src/middleware/validation.middleware.js
const { ApiError } = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      errors: {
        wrap: {
          label: ''
        }
      },
      abortEarly: false
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new ApiError(400, errorMessage));
    }

    next();
  };
};

module.exports = validate;