// src/jobs/genreNotificationProcessor.js
const cron = require('node-cron');
const notificationService = require('../api/v1/notifications/notification.service');
const logger = require('../utils/logger');

// Run once a day at midnight
cron.schedule('0 0 * * *', async () => {
  logger.info('Starting genre notification processing job');
  try {
    await notificationService.processGenreNotifications();
    logger.info('Genre notification processing job completed successfully');
  } catch (error) {
    logger.error('Error in genre notification processing job:', error);
  }
});