// src/api/v1/release/release.service.js
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const Reminder = require('../models/reminder.model');
const Notification = require('../models/notification.model');
const emailService = require('./email.service');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

class ReleaseService {
  async setReminder(userId, movieId, type) {
    let createdReminder = null;
    try {
      // Find movie and user details
      const [movie, user] = await Promise.all([
        Movie.findById(movieId),
        User.findById(userId)
      ]);

      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check for existing reminder
      const existingReminder = await Reminder.findOne({
        userId,
        movieId,
        type,
        status: 'pending'
      });

      if (existingReminder) {
        throw new ApiError(400, 'Reminder already exists for this movie');
      }

      // Calculate reminder date
      let reminderDate = new Date(movie.releaseDate);
      if (type === 'release') {
        reminderDate.setDate(reminderDate.getDate() - 1);
      }

      // Create reminder
      createdReminder = await Reminder.create({
        userId,
        movieId,
        type,
        reminderDate,
        status: 'pending',
        notificationsSent: []
      });

      // Create notification
      const notification = await Notification.create({
        userId,
        type: type === 'release' ? 'release' : 'trailer', // Map to valid notification type
        title: `Reminder Set: ${movie.title}`,
        message: `You will be notified before "${movie.title}" ${type === 'release' ? 'releases' : 'trailer drops'}.`,
        movieId: movie._id,
        status: 'unread',
        isRead: false
      });

      // Send email notification (non-critical operation)
      try {
        const emailResult = await emailService.sendReleaseReminder(user, movie);
        
        if (emailResult.success) {
          await Reminder.findByIdAndUpdate(createdReminder._id, {
            $push: {
              notificationsSent: {
                type: 'email',
                sentAt: new Date()
              }
            }
          });
          logger.info(`Email sent successfully for reminder ${createdReminder._id}`);
        }
      } catch (emailError) {
        logger.error('Error sending email:', emailError);
      }

      // Update reminder with dashboard notification record
      await Reminder.findByIdAndUpdate(createdReminder._id, {
        $push: {
          notificationsSent: {
            type: 'dashboard',
            sentAt: new Date()
          }
        }
      });

      // Return populated reminder
      const populatedReminder = await Reminder.findById(createdReminder._id)
        .populate('movieId', 'title releaseDate')
        .populate('notificationsSent');

      return {
        reminder: populatedReminder,
        notification,
        message: `Reminder set successfully for ${movie.title}`
      };

    } catch (error) {
      logger.error('Error in setReminder:', error);
      
      // Cleanup if reminder was created but subsequent operations failed
      if (createdReminder) {
        try {
          await Reminder.findByIdAndDelete(createdReminder._id);
          logger.info(`Cleaned up reminder ${createdReminder._id} after error`);
        } catch (cleanupError) {
          logger.error('Error during cleanup:', cleanupError);
        }
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error setting reminder');
    }
  }
  
  async getUpcomingReleases(filters = {}, page = 1, limit = 10) {
    try {
      const query = {
        isActive: true,
        status: { $in: ['Coming Soon', 'In Production'] },
        releaseDate: { $gt: new Date() }
      };

      if (filters.genre) {
        query.genre = Array.isArray(filters.genre) ? { $in: filters.genre } : filters.genre;
      }

      if (filters.period) {
        const endDate = new Date();
        switch (filters.period) {
          case 'week':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'month':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'year':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        }
        query.releaseDate.$lt = endDate;
      }

      const releases = await Movie.find(query)
        .sort({ releaseDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Movie.countDocuments(query);

      return {
        results: releases,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching upcoming releases');
    }
  }

  async getUserReminders(userId, page = 1, limit = 10) {
    try {
      const reminders = await Reminder.find({
        userId,
        status: 'pending'
      })
      .populate('movieId', 'title releaseDate coverPhoto')
      .sort({ reminderDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

      const total = await Reminder.countDocuments({
        userId,
        status: 'pending'
      });

      return {
        results: reminders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching reminders');
    }
  }

  async cancelReminder(userId, movieId, type) {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        {
          userId,
          movieId,
          type,
          status: 'pending'
        },
        {
          status: 'cancelled',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!reminder) {
        throw new ApiError(404, 'Reminder not found');
      }

      const movie = await Movie.findById(movieId);
      await Notification.create({
        userId,
        type: 'reminder_cancelled',
        title: 'Reminder Cancelled',
        message: `Reminder for "${movie.title}" has been cancelled`,
        movieId: movie._id,
        status: 'unread'
      });

      return {
        reminder,
        message: 'Reminder cancelled successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error cancelling reminder');
    }
  }
}

module.exports = new ReleaseService();