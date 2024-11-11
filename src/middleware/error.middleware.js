// src/middleware/error.middleware.js
const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error('Global error handler caught error:', err);

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation Error',
      error: err.errors
    });
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Invalid ID format',
      error: err
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Invalid JSON format',
      error: err
    });
  }

  return ApiResponse.error(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};

module.exports = errorHandler;