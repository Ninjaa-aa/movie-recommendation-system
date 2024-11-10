// scripts/emailTest.js
require('dotenv').config();  // Add this line
const EmailService = require('../src/services/email.service');
const logger = require('../src/utils/logger');

async function testEmail() {
  try {
    // Use environment variables for test email
    const testUser = {
      name: 'Test User',
      email: 'hammadzahid254@gmail.com'  // Your email address
    };

    const testMovie = {
      title: 'The Test Movie',
      releaseDate: new Date('2024-12-25'),
      coverPhoto: {
        filePath: 'https://via.placeholder.com/300x450'
      },
      genre: ['Action', 'Adventure'],
      director: 'Test Director',
      runtime: 120,
      synopsis: 'An exciting test movie that will keep you on the edge of your seat!',
      _id: '123456789'
    };

    // Test all email types
    const results = await Promise.all([
      EmailService.sendReleaseReminder(testUser, testMovie),
      EmailService.sendTrailerNotification(testUser, testMovie),
      EmailService.sendGenreUpdateNotification(testUser, [testMovie])
    ]);

    results.forEach((result, index) => {
      const type = ['Release reminder', 'Trailer notification', 'Genre update'][index];
      if (result.success) {
        logger.info(`${type} email sent successfully (Message ID: ${result.messageId})`);
      } else {
        logger.error(`${type} email failed:`, result.error);
      }
    });

    logger.info('Email tests completed');
  } catch (error) {
    logger.error('Error during email testing:', error);
  } finally {
    process.exit();
  }
}

testEmail();