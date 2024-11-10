// src/jobs/reminderProcessor.js
const cron = require('node-cron');
const releaseService = require('../api/v1/releases/release.service');
const logger = require('../utils/logger');

// Run every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Starting reminder processing job');
  try {
    await releaseService.processReminders();
    logger.info('Reminder processing job completed successfully');
  } catch (error) {
    logger.error('Error in reminder processing job:', error);
  }
});