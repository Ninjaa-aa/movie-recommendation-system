const UserService = require('../services/user.service');
const { ApiResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');  // Make sure you have this import

class UserController {
  constructor() {
    this.userService = new UserService();
    
    // Bind all methods to preserve 'this' context
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  async getProfile(req, res, next) {
    try {
      if (!req.user?._id) {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: 'User not authenticated'
        });
      }

      const user = await this.userService.getProfile(req.user._id);
      return ApiResponse.success(res, {
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      if (!req.user?._id) {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: 'User not authenticated'
        });
      }

      const updatedUser = await this.userService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, {
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new ApiError(401, 'User not authenticated');
      }

      logger.debug('Updating preferences for user:', req.user._id);
      logger.debug('Request body:', req.body);

      const updatedUser = await this.userService.updatePreferences(req.user._id, req.body);
      
      return ApiResponse.success(res, {
        message: 'Preferences updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Error in updatePreferences:', {
        error: error.message,
        stack: error.stack,
        statusCode: error.statusCode
      });

      // If it's already an ApiError, pass it through
      if (error instanceof ApiError) {
        return next(error);
      }

      // Convert other errors to ApiError
      if (error.name === 'ValidationError') {
        return next(new ApiError(400, 'Invalid preference values'));
      }

      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        logger.error('Database error during preference update:', error);
        return next(new ApiError(500, 'Database error while updating preferences'));
      }

      // Handle any other unexpected errors
      logger.error('Unexpected error during preference update:', error);
      return next(new ApiError(500, 'An unexpected error occurred while updating preferences'));
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role, isActive } = req.query;
      const users = await this.userService.getUsers({ page, limit, search, role, isActive });
      return ApiResponse.success(res, {
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create and export a single instance
module.exports = new UserController();