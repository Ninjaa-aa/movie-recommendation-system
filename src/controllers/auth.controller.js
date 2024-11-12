const AuthService = require('../services/auth.service');
const { ApiResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * @throws {ApiError} If validation fails or registration fails
   */
  register = async (req, res, next) => {
    try {
      console.log('Registration attempt:', { email: req.body.email, name: req.body.name });

      const { email, password, name } = req.body;
      
      // Validation with proper ApiError
      if (!email || !password || !name) {
        throw new ApiError(400, 'All fields are required: email, password, and name');
      }

      const { user, token } = await this.authService.register({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim()
      });
      
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      };

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'User registered successfully',
        data: { user: sanitizedUser, token }
      });
    } catch (error) {
      // Handle specific error cases
      if (error.code === 11000) {
        return next(new ApiError(409, 'Email is already registered'));
      }
      if (error instanceof ApiError) {
        return next(error);
      }
      // Handle unexpected errors
      console.error('Registration error:', error);
      return next(new ApiError(500, 'An error occurred during registration'));
    }
  };

  /**
   * Login user
   * @throws {ApiError} If validation fails or login fails
   */
  login = async (req, res, next) => {
    try {
      console.log('Login attempt:', { email: req.body.email });

      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      const { user, token } = await this.authService.login({
        email: email.toLowerCase().trim(),
        password
      });

      const sanitizedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      };

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Login successful',
        data: { user: sanitizedUser, token }
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message === 'Invalid credentials') {
        return next(new ApiError(401, 'Invalid email or password'));
      }
      if (error instanceof ApiError) {
        return next(error);
      }
      // Handle unexpected errors
      console.error('Login error:', error);
      return next(new ApiError(500, 'An error occurred during login'));
    }
  };

  /**
   * Get current user profile
   * @throws {ApiError} If user is not authenticated
   */
  getMe = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const sanitizedUser = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        createdAt: req.user.createdAt
      };

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Profile retrieved successfully',
        data: { user: sanitizedUser }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }
      console.error('Get profile error:', error);
      return next(new ApiError(500, 'An error occurred while retrieving profile'));
    }
  };

  /**
   * Refresh authentication token
   * @throws {ApiError} If refresh token is invalid or missing
   */
  refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      const { user, token } = await this.authService.refreshToken(refreshToken);

      const sanitizedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      };

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: { user: sanitizedUser, token }
      });
    } catch (error) {
      if (error.message === 'Invalid refresh token') {
        return next(new ApiError(401, 'Invalid refresh token'));
      }
      if (error instanceof ApiError) {
        return next(error);
      }
      console.error('Token refresh error:', error);
      return next(new ApiError(500, 'An error occurred while refreshing token'));
    }
  };
}

module.exports = new AuthController();