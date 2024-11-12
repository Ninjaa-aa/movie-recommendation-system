// src/services/broadcast.service.js
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const emailService = require('./email.service');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

class BroadcastService {
  async broadcastToAllUsers(notification) {
    try {
      // Get all active users
      const users = await User.find({ isActive: true });
      
      if (!users.length) {
        logger.warn('No active users found for broadcasting');
        return { success: true, recipientCount: 0 };
      }

      const broadcasts = [];
      
      // Prepare notifications for all users
      for (const user of users) {
        broadcasts.push({
          userId: user._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          movieId: notification.movieId,
          status: 'unread',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Bulk insert notifications
      const createdNotifications = await Notification.insertMany(broadcasts);
      
      // Send emails in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const userBatch = users.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(userBatch.map(user => 
          emailService.sendGenericNotification(user, notification)
        ));
      }
      
      logger.info(`Broadcast successful: ${createdNotifications.length} notifications created for ${users.length} users`);
      return { 
        success: true, 
        recipientCount: users.length,
        notificationCount: createdNotifications.length 
      };
    } catch (error) {
      logger.error('Error in broadcast service:', error);
      throw new ApiError(500, 'Failed to broadcast notification');
    }
  }
}

module.exports = new BroadcastService();