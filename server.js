require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const configureApp = require('./src/config/app');
const logger = require('./src/utils/logger');
const { createUploadDirectories } = require('./src/config/upload');

// Error handlers
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error('Error name:', err.name);
  logger.error('Error message:', err.message);
  logger.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error('Error name:', err.name);
  logger.error('Error message:', err.message);
  logger.error('Stack trace:', err.stack);
  process.exit(1);
});

const findAvailablePort = async (startPort) => {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    
    const tryPort = (port) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      
      server.listen(port);
    };
    
    tryPort(startPort);
  });
};

const startServer = async () => {
  try {
    logger.info('Starting server initialization...');

    // Create upload directories
    logger.info('Creating upload directories...');
    await createUploadDirectories();

    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();

    // Initialize express app
    logger.info('Initializing Express app...');
    const app = express();
    
    // Configure app
    logger.info('Configuring Express app...');
    await configureApp(app);

    // Find available port
    const preferredPort = parseInt(process.env.PORT) || 3000;
    const port = await findAvailablePort(preferredPort);
    
    if (port !== preferredPort) {
      logger.warn(`Port ${preferredPort} was in use, using port ${port} instead`);
    }

    // Start server
    const server = app.listen(port, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
      logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated!');
        process.exit(0);
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use. Please try a different port.`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Fatal error starting server:');
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error in startServer:');
  logger.error('Error name:', error.name);
  logger.error('Error message:', error.message);
  logger.error('Stack trace:', error.stack);
  process.exit(1);
});