// src/api/v1/users/user.controller.js
const UserService = require('./user.service');
const { ApiResponse } = require('../../../utils/apiResponse');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req, res, next) => {
    try {
      // Add null check for req.user
      if (!req.user?._id) {
        return ApiResponse.error(res, 401, 'User not authenticated');
      }

      const user = await this.userService.getProfile(req.user._id);
      return ApiResponse.success(res, {
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      // Add null check for req.user
      if (!req.user?._id) {
        return ApiResponse.error(res, 401, 'User not authenticated');
      }

      const updatedUser = await this.userService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, {
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req, res, next) => {
    try {
      // Add null check for req.user
      if (!req.user?._id) {
        return ApiResponse.error(res, 401, 'User not authenticated');
      }

      const updatedUser = await this.userService.updatePreferences(req.user._id, req.body);
      return ApiResponse.success(res, {
        message: 'Preferences updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();