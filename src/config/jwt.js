// src/config/jwt.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiResponse');

const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Authentication required. Please login.');
    }

    // Check if token format is correct
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ApiError(401, 'Invalid token format. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired. Please login again.');
      }
      throw new ApiError(401, 'Invalid token. Please login again.');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken
};