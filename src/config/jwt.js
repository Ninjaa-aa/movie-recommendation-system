// src/config/jwt.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/user.model');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
};

const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please login.');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token. Please login again.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired. Please login again.'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  jwtConfig,
  verifyToken
};