const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiResponse');

const debug = (message, data = '') => {
  console.log(`[JWT Debug] ${message}`, data);
};

const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    debug('Auth Header:', authHeader);

    if (!authHeader) {
      throw new ApiError(401, 'Authentication required. Please login.');
    }

    // Check if token format is correct
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ApiError(401, 'Invalid token format. Use: Bearer <token>');
    }

    const token = parts[1];
    debug('Extracted Token:', token.substring(0, 10) + '...');

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      debug('JWT_SECRET is missing or empty');
      throw new ApiError(500, 'JWT configuration error');
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });
      
      debug('Decoded token:', decoded);

      // Check for either id or _id in the decoded token
      const userId = decoded.id || decoded._id;
      if (!userId) {
        debug('Missing user ID in decoded token');
        throw new ApiError(401, 'Invalid token structure');
      }

      // Set user info in request with consistent _id field
      req.user = {
        _id: userId,
        role: decoded.role || 'user',
        email: decoded.email
      };

      debug('User set in request:', req.user);
      next();
    } catch (err) {
      debug('JWT Verification Error:', {
        name: err.name,
        message: err.message
      });

      if (err instanceof ApiError) {
        throw err;
      }
      
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired. Please login again.');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Invalid token. Please login again.');
      }
      if (err.name === 'NotBeforeError') {
        throw new ApiError(401, 'Token not yet active. Please try again.');
      }
      
      throw new ApiError(401, `Token verification failed: ${err.message}`);
    }
  } catch (error) {
    next(error);
  }
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  // Use consistent field name 'id' in token payload
  const token = jwt.sign(
    {
      id: user._id, // Use 'id' to match what we're receiving
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256'
    }
  );

  debug('Generated new token:', {
    user: user._id,
    tokenPrefix: token.substring(0, 10) + '...'
  });

  return token;
};

module.exports = {
  verifyToken,
  generateToken
};