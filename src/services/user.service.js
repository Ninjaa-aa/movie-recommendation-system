const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class UserService {
  async getProfile(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('profile.preferences.genres')
      .lean();
      
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const allowedUpdates = [
      'name', 
      'email',
      'profile.bio',
      'profile.avatar',
      'currentPassword',
      'newPassword',
      'emailNotifications'
    ];

    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update) || update.startsWith('profile.preferences.')
    );

    if (!isValidOperation) {
      throw new ApiError(400, 'Invalid updates detected');
    }

    try {
      // Handle password update if provided
      if (updateData.newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) {
          throw new ApiError(404, 'User not found');
        }

        const isPasswordValid = await user.comparePassword(updateData.currentPassword);
        if (!isPasswordValid) {
          throw new ApiError(401, 'Current password is incorrect');
        }

        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.newPassword, salt);
        delete updateData.newPassword;
        delete updateData.currentPassword;
      }

      // Format update data
      const formattedData = this._formatUpdateData(updateData);

      // Use findOneAndUpdate with proper options
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: formattedData },
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );

      if (!updatedUser) {
        throw new ApiError(404, 'User not found');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      if (error.name === 'ValidationError') {
        throw new ApiError(400, 'Invalid update values');
      }

      logger.error('Error in updateProfile:', error);
      throw new ApiError(500, 'Error updating profile');
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID format');
      }

      // First, check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Initialize the update operations
      let updateOperations = {};

      // Handle age rating update
      if (preferences.ageRating) {
        if (!['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(preferences.ageRating)) {
          throw new ApiError(400, 'Invalid age rating value');
        }
        updateOperations['profile.preferences.ageRating'] = preferences.ageRating;
      }

      // Handle genres updates sequentially
      if (preferences.genres || preferences.addGenres || preferences.removeGenres) {
        const validGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'];
        let currentGenres = user.profile.preferences.genres || [];

        // If complete genres array is provided, use it directly
        if (preferences.genres) {
          if (!preferences.genres.every(genre => validGenres.includes(genre))) {
            throw new ApiError(400, 'Invalid genre values provided');
          }
          currentGenres = preferences.genres;
        } else {
          // Handle additions
          if (preferences.addGenres) {
            if (!preferences.addGenres.every(genre => validGenres.includes(genre))) {
              throw new ApiError(400, 'Invalid genre values in addGenres');
            }
            currentGenres = [...new Set([...currentGenres, ...preferences.addGenres])];
          }

          // Handle removals
          if (preferences.removeGenres) {
            if (!preferences.removeGenres.every(genre => validGenres.includes(genre))) {
              throw new ApiError(400, 'Invalid genre values in removeGenres');
            }
            currentGenres = currentGenres.filter(genre => !preferences.removeGenres.includes(genre));
          }
        }

        updateOperations['profile.preferences.genres'] = currentGenres;
      }

      // Handle actors updates
      if (preferences.actors || preferences.addActors || preferences.removeActors) {
        let currentActors = user.profile.preferences.actors || [];

        if (preferences.actors) {
          if (!Array.isArray(preferences.actors)) {
            throw new ApiError(400, 'Actors must be an array');
          }
          currentActors = preferences.actors;
        } else {
          if (preferences.addActors) {
            currentActors = [...new Set([...currentActors, ...preferences.addActors])];
          }
          if (preferences.removeActors) {
            currentActors = currentActors.filter(actor => !preferences.removeActors.includes(actor));
          }
        }

        updateOperations['profile.preferences.actors'] = currentActors;
      }

      // Handle directors updates
      if (preferences.directors || preferences.addDirectors || preferences.removeDirectors) {
        let currentDirectors = user.profile.preferences.directors || [];

        if (preferences.directors) {
          if (!Array.isArray(preferences.directors)) {
            throw new ApiError(400, 'Directors must be an array');
          }
          currentDirectors = preferences.directors;
        } else {
          if (preferences.addDirectors) {
            currentDirectors = [...new Set([...currentDirectors, ...preferences.addDirectors])];
          }
          if (preferences.removeDirectors) {
            currentDirectors = currentDirectors.filter(director => !preferences.removeDirectors.includes(director));
          }
        }

        updateOperations['profile.preferences.directors'] = currentDirectors;
      }

      // If no updates were specified, return the original user
      if (Object.keys(updateOperations).length === 0) {
        return user;
      }

      // Perform the update
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateOperations },
        {
          new: true,
          runValidators: true,
          select: '-password'
        }
      );

      if (!updatedUser) {
        throw new ApiError(404, 'User not found after update');
      }

      logger.debug('Successfully updated preferences:', {
        userId,
        updates: updateOperations
      });

      return updatedUser;

    } catch (error) {
      logger.error('Error in updatePreferences:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        throw new ApiError(400, 'Invalid preference values');
      }

      if (error.name === 'MongoServerError') {
        logger.error('MongoDB error details:', error);
        throw new ApiError(500, 'Database error while updating preferences');
      }

      throw new ApiError(500, 'An unexpected error occurred while updating preferences');
    }
  }

  _formatUpdateData(updateData) {
    const formattedData = {};
    
    Object.keys(updateData).forEach(key => {
      // Skip password-related fields as they're handled separately
      if (['currentPassword', 'newPassword'].includes(key)) return;

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