// src/api/v1/users/user.service.js
const User = require('../../../models/user.model');
const { ApiError } = require('../../../utils/apiResponse');

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedUpdates = ['name', 'profile.bio', 'profile.avatar'];
    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new ApiError(400, 'Invalid updates');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    updates.forEach(update => {
      if (update.includes('.')) {
        const [key, field] = update.split('.');
        user[key][field] = updateData[update];
      } else {
        user[update] = updateData[update];
      }
    });

    await user.save();
    return user;
  }

  async updatePreferences(userId, { genres, actors, directors }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (genres) user.profile.preferences.genres = genres;
    if (actors) user.profile.preferences.actors = actors;
    if (directors) user.profile.preferences.directors = directors;

    await user.save();
    return user;
  }
}

module.exports = UserService;