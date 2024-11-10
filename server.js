// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const configureApp = require('./src/config/app');
const logger = require('./src/utils/logger');

// Move error handlers to the top level
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize express app
    const app = express();
    
    // Configure app
    configureApp(app);

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated!');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Error starting server:', error.stack);
    process.exit(1);
  }
};

startServer();