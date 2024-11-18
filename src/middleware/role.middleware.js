// src/middleware/role.middleware.js
const ApiError = require('../utils/ApiError');
const { ApiResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware to authorize roles with enhanced admin validation
 * @param {...string} roles - Roles to check for authorization
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      logger.debug('Role authorization check:', {
        userRole: req?.user?.role,
        requiredRoles: roles,
        userId: req?.user?._id
      });

      // Check if user exists and has role property
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!req.user.role) {
        logger.error('User missing role property:', {
          userId: req.user._id,
          user: req.user
        });
        throw new ApiError(500, 'User role not properly configured');
      }

      // Special handling for admin role
      if (roles.includes('admin')) {
        if (req.user.role !== 'admin') {
          logger.warn('Unauthorized admin access attempt:', {
            userId: req.user._id,
            userRole: req.user.role,
            attemptedAccess: req.originalUrl
          });
          throw new ApiError(403, 'This action requires administrator privileges');
        }
        
        logger.info('Admin access granted:', {
          userId: req.user._id,
          endpoint: req.originalUrl
        });
      }
      // Check for other roles
      else if (!roles.includes(req.user.role)) {
        logger.warn('Unauthorized role access attempt:', {
          userId: req.user._id,
          userRole: req.user.role,
          requiredRoles: roles,
          attemptedAccess: req.originalUrl
        });
        throw new ApiError(403, `This action requires ${roles.join(' or ')} role`);
      }

      logger.debug('Role authorization successful:', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles
      });

      next();
    } catch (error) {
      logger.error('Role authorization error:', {
        error: error.message,
        stack: error.stack,
        userId: req?.user?._id,
        endpoint: req.originalUrl
      });

      if (error instanceof ApiError) {
        return ApiResponse.error(res, error.statusCode, error.message);
      }

      return ApiResponse.error(res, 500, 'An error occurred during role verification');
    }
  };
};

/**
 * Middleware specifically for admin validation
 */
const isAdmin = (req, res, next) => {
  try {
    logger.debug('Admin validation check:', {
      userId: req?.user?._id,
      userRole: req?.user?.role
    });

    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (req.user.role !== 'admin') {
      logger.warn('Non-admin access attempt:', {
        userId: req.user._id,
        userRole: req.user.role,
        attemptedAccess: req.originalUrl
      });
      throw new ApiError(403, 'This action requires administrator privileges');
    }

    logger.info('Admin access granted:', {
      userId: req.user._id,
      endpoint: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Admin validation error:', {
      error: error.message,
      stack: error.stack,
      userId: req?.user?._id,
      endpoint: req.originalUrl
    });

    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.statusCode, error.message);
    }

    return ApiResponse.error(res, 500, 'An error occurred during admin validation');
  }
};

module.exports = {
  authorizeRoles,
  isAdmin
};