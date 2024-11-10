// src/api/v1/auth/auth.service.js
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const { ApiError } = require('../../../utils/apiResponse');

class AuthService {
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async register({ email, password, name }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    // Check if this is the first user (will be admin)
    const isFirstUser = (await User.countDocuments({})) === 0;
    
    // Create new user
    const user = await User.create({
      email,
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
  }

  async login({ email, password }) {
    // Find user and select password
    const user = await User.findOne({ email }).select('+password');
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
  }
}

module.exports = AuthService;