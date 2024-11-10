// src/api/v1/release/release.service.js
const Movie = require('../../../models/movie.model');
const Reminder = require('../../../models/reminder.model');
const Notification = require('../../../models/notification.model');
const ApiError = require('../../../utils/ApiError');

class ReleaseService {
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

  async setReminder(userId, movieId, type) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      const existingReminder = await Reminder.findOne({
        userId,
        movieId,
        type,
        status: 'pending'
      });

      if (existingReminder) {
        throw new ApiError(400, 'Reminder already exists for this movie');
      }

      let reminderDate = new Date(movie.releaseDate);
      if (type === 'release') {
        reminderDate.setDate(reminderDate.getDate() - 1);
      }

      const reminder = await Reminder.create({
        userId,
        movieId,
        type,
        reminderDate,
        status: 'pending'
      });

      const notification = await Notification.create({
        userId,
        type: 'reminder_set',
        title: `Reminder Set for ${movie.title}`,
        message: `You will be notified before "${movie.title}" ${type === 'release' ? 'releases' : 'trailer drops'}.`,
        movieId: movie._id,
        status: 'unread'
      });

      return {
        reminder: await reminder.populate('movieId', 'title releaseDate'),
        notification,
        message: `Reminder set successfully for ${movie.title}`
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error setting reminder');
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