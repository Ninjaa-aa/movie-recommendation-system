const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError'); // Fixed import

class AuthService {
  /**
   * Generate JWT token
   * @param {string} userId - User ID to encode in token
   * @returns {string} JWT token
   */
  generateToken(userId) {
    try {
      return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    } catch (error) {
      throw new ApiError(500, 'Error generating token');
    }
  }

  /**
   * Register new user
   * @param {Object} params - Registration parameters
   * @param {string} params.email - User email
   * @param {string} params.password - User password
   * @param {string} params.name - User name
   * @returns {Promise<{user: Object, token: string}>}
   * @throws {ApiError}
   */
  async register({ email, password, name }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(409, 'Email already exists');
      }

      // Check if this is the first user (will be admin)
      const isFirstUser = (await User.countDocuments({})) === 0;
      
      // Create new user
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
        role: isFirstUser ? 'admin' : 'user'
      });

      // Generate token
      const token = this.generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ApiError(409, 'Email already exists');
      }
      console.error('Registration error in service:', error);
      throw new ApiError(500, 'Error registering user');
    }
  }

  /**
   * Login user
   * @param {Object} params - Login parameters
   * @param {string} params.email - User email
   * @param {string} params.password - User password
   * @returns {Promise<{user: Object, token: string}>}
   * @throws {ApiError}
   */
  async login({ email, password }) {
    try {
      // Find user and select password
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(401, 'Account is deactivated');
      }

      // Generate token
      const token = this.generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Login error in service:', error);
      throw new ApiError(500, 'Error during login');
    }
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<{user: Object, token: string}>}
   * @throws {ApiError}
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Get user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new token
      const token = this.generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Invalid refresh token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Refresh token expired');
      }
      console.error('Token refresh error in service:', error);
      throw new ApiError(500, 'Error refreshing token');
    }
  }
}

module.exports = AuthService;