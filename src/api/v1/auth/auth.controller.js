// src/api/v1/auth/auth.controller.js
const AuthService = require('./auth.service');
const { ApiResponse } = require('../../../utils/apiResponse');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const { user, token } = await this.authService.register({ email, password, name });
      
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'User registered successfully',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login({ email, password });

      return ApiResponse.success(res, {
        message: 'Login successful',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      const user = req.user;
      return ApiResponse.success(res, {
        message: 'User profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();