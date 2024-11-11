// src/api/v1/users/user.service.js
const User = require('../../../models/user.model');
const { ApiError } = require('../../../utils/apiResponse');
const mongoose = require('mongoose');

class UserService {
  async getProfile(userId) {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const allowedUpdates = ['name', 'profile.bio', 'profile.avatar'];
    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new ApiError(400, 'Invalid updates');
    }

    // Use findOneAndUpdate with proper options
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: this._formatUpdateData(updateData) },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async updatePreferences(userId, { genres, actors, directors }) {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    // Use findOneAndUpdate with proper options
    const updateData = {
      'profile.preferences': {}
    };

    if (genres) updateData['profile.preferences'].genres = genres;
    if (actors) updateData['profile.preferences'].actors = actors;
    if (directors) updateData['profile.preferences'].directors = directors;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  // Helper method to format update data
  _formatUpdateData(updateData) {
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (!formattedData[parent]) formattedData[parent] = {};
        formattedData[parent][child] = updateData[key];
      } else {
        formattedData[key] = updateData[key];
      }
    });

    return formattedData;
  }
}

module.exports = UserService;