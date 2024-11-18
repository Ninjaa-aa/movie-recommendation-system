// src/config/jwt.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { ApiResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    logger.debug('[JWT Debug] Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided or invalid token format');
    }

    // Get token
    const token = authHeader.split(' ')[1];
    logger.debug('[JWT Debug] Extracted Token:', token.substring(0, 10) + '...');

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      logger.debug('[JWT Debug] Decoded token:', decoded);

      // Add user info to request
      req.user = {
        _id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };

      logger.debug('[JWT Debug] User set in request:', req.user);
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Invalid token');
      }
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token has expired');
      }
      throw new ApiError(401, 'Token verification failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.statusCode, error.message);
    }
    logger.error('JWT Verification Error:', error);
    return ApiResponse.error(res, 500, 'Internal server error during authentication');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};