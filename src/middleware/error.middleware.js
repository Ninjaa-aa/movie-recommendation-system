// src/middleware/error.middleware.js
const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: Object.values(err.errors).map(error => error.message).join(', ')
    });
  }

  if (err.code === 11000) {
    return ApiResponse.error(res, {
      statusCode: 409,
      message: 'Duplicate field value entered'
    });
  }

  if (err.isOperational) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message
    });
  }

  return ApiResponse.error(res, {
    statusCode: 500,
    message: 'Something went wrong'
  });
};

module.exports = errorHandler;