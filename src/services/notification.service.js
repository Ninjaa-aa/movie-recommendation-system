// src/api/v1/notifications/notification.service.js
const Notification = require('../models/notification.model');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

const broadcastService = require('./broadcast.service');

class NotificationService {
  async createNotification(notificationData) {
    try {
      // First broadcast to all users
      await broadcastService.broadcastToAllUsers(notificationData);
      
      return { message: 'Notification created and broadcast successfully' };
    } catch (error) {
      throw new ApiError(500, 'Error creating and broadcasting notification');
    }
  }

  // Updated processGenreNotifications to use broadcast
  async processGenreNotifications() {
    const lastCheck = new Date();
    lastCheck.setDate(lastCheck.getDate() - 1);

    const newMovies = await Movie.find({
      createdAt: { $gte: lastCheck },
      status: 'Coming Soon'
    });

    if (newMovies.length === 0) return;

    // Create a single notification for broadcasting
    const notificationData = {
      type: 'genre_update',
      title: 'New Movies Added',
      message: `${newMovies.length} new movies have been added to our database!`,
      movieId: newMovies[0]._id
    };

    // Broadcast to all users
    await broadcastService.broadcastToAllUsers(notificationData);

    // Send targeted emails to users based on their genre preferences
    const users = await User.find({
      favoriteGenres: { $exists: true, $ne: [] }
    });

    for (const user of users) {
      const matchingMovies = newMovies.filter(movie =>
        movie.genre.some(genre => user.favoriteGenres.includes(genre))
      );

      if (matchingMovies.length > 0) {
        await emailService.sendGenreUpdateNotification(user, matchingMovies);
      }
    }
  }
  
  async getUserNotifications(userId, page = 1, limit = 10) {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('movieId', 'title coverPhoto');

    const total = await Notification.countDocuments({ userId });

    return {
      results: notifications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    notification.isRead = true;
    notification.status = 'read';
    await notification.save();

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, status: 'unread' },
      { $set: { status: 'read', isRead: true } }
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      userId,
      status: 'unread'
    });

    return { count };
  }

  // Process notifications for new movies in favorite genres
  async processGenreNotifications() {
    const lastCheck = new Date();
    lastCheck.setDate(lastCheck.getDate() - 1); // Check last 24 hours

    // Get new movies
    const newMovies = await Movie.find({
      createdAt: { $gte: lastCheck },
      status: 'Coming Soon'
    });

    if (newMovies.length === 0) return;

    // Get all users with their favorite genres
    const users = await User.find({
      favoriteGenres: { $exists: true, $ne: [] }
    });

    for (const user of users) {
      // Filter movies matching user's favorite genres
      const matchingMovies = newMovies.filter(movie =>
        movie.genre.some(genre => user.favoriteGenres.includes(genre))
      );

      if (matchingMovies.length > 0) {
        // Create notification
        await Notification.create({
          userId: user._id,
          type: 'genre_update',
          title: 'New Movies in Your Favorite Genres',
          message: `${matchingMovies.length} new movies added in your favorite genres!`,
          movieId: matchingMovies[0]._id // Reference to first movie
        });

        // Send email
        await emailService.sendGenreUpdateNotification(user, matchingMovies);
      }
    }
  }
}

module.exports = new NotificationService();