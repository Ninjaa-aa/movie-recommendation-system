// src/utils/apiResponse.js
class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, { statusCode = 500, message = 'Internal Server Error' }) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  }
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { ApiResponse, ApiError };