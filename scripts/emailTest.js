// scripts/emailTest.js
require('dotenv').config();
const EmailService = require('../src/services/email.service');
const logger = require('../src/utils/logger');

async function testSMTPConnection() {
  logger.info('Testing SMTP connection...');
  
  try {
    const result = await EmailService.transporter.verify();
    logger.info('SMTP connection test result:', result);
    return result;
  } catch (error) {
    logger.error('SMTP connection test failed:', error);
    return false;
  }
}


async function testEmail() {
  logger.info('Starting email tests...');
  
  // Test SMTP connection first
  const connectionTest = await testSMTPConnection();
  if (!connectionTest) {
    logger.error('SMTP connection failed. Please check your credentials and network connection.');
    process.exit(1);
  }

  // Test user
  const testUser = {
    name: 'Test User',
    email: 'i222433@nu.edu.pk'  // Hardcoded recipient
  };

  // Test movie
  const testMovie = {
    title: 'Test Movie Title',
    releaseDate: new Date('2024-12-25'),
    coverPhoto: 'https://via.placeholder.com/300x450',
    genre: ['Action', 'Adventure'],
    director: 'Test Director',
    synopsis: 'This is a test movie synopsis for email testing.',
    _id: '123456789'
  };

  logger.info('Starting email tests...');
  logger.info(`Using email configuration:
    - SMTP Service: Gmail
    - From: ${process.env.EMAIL_USER}
    - To: ${testUser.email}
  `);

  // Test release reminder email
  try {
    logger.info('Testing release reminder email...');
    const releaseResult = await EmailService.sendReleaseReminder(testUser, testMovie);
    
    if (releaseResult.success) {
      logger.info('✓ Release reminder email sent successfully');
      logger.info(`  Message ID: ${releaseResult.messageId}`);
    } else {
      logger.error('✗ Release reminder email failed:', releaseResult.error);
    }
  } catch (error) {
    logger.error('✗ Release reminder email error:', error.message);
  }

  // Test trailer notification email
  try {
    logger.info('\nTesting trailer notification email...');
    const trailerResult = await EmailService.sendTrailerNotification(testUser, testMovie);
    
    if (trailerResult.success) {
      logger.info('✓ Trailer notification email sent successfully');
      logger.info(`  Message ID: ${trailerResult.messageId}`);
    } else {
      logger.error('✗ Trailer notification email failed:', trailerResult.error);
    }
  } catch (error) {
    logger.error('✗ Trailer notification error:', error.message);
  }

  // Test generic notification
  try {
    logger.info('\nTesting generic notification email...');
    const genericNotification = {
      title: 'Test Notification',
      message: 'This is a test generic notification'
    };
    
    const genericResult = await EmailService.sendGenericNotification(testUser, genericNotification);
    
    if (genericResult.success) {
      logger.info('✓ Generic notification email sent successfully');
      logger.info(`  Message ID: ${genericResult.messageId}`);
    } else {
      logger.error('✗ Generic notification email failed:', genericResult.error);
    }
  } catch (error) {
    logger.error('✗ Generic notification error:', error.message);
  }

  logger.info('\nEmail test summary:');
  logger.info('- Check your inbox at: hammadzahid254@gmail.com');
  logger.info('- If you don\'t see the emails:');
  logger.info('  1. Check your spam folder');
  logger.info('  2. Verify your Gmail credentials in .env file');
  logger.info('  3. Make sure you\'re using an App Password if 2FA is enabled');
  
  logger.info('\nEmail configuration troubleshooting:');
  logger.info(`- EMAIL_USER set: ${Boolean(process.env.EMAIL_USER)}`);
  logger.info(`- EMAIL_APP_PASSWORD set: ${Boolean(process.env.EMAIL_APP_PASSWORD)}`);
  logger.info(`- EMAIL_USER length: ${process.env.EMAIL_USER?.length || 0}`);
  logger.info(`- EMAIL_APP_PASSWORD length: ${process.env.EMAIL_APP_PASSWORD?.length || 0}`);
}

// Execute tests
testEmail()
  .then(() => {
    logger.info('\nTest script completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error('\nTest script failed:', error);
    process.exit(1);
  });
