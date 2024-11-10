// src/config/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { setupSwagger } = require('./swagger');
const routes = require('../api/v1/routes');
const errorHandler = require('../middleware/error.middleware');
const { ApiResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const configureApp = (app) => {
  try {
    // Security Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Simple request logging middleware
    // app.use((req, res, next) => {
    //   logger.debug(`${req.method} ${req.originalUrl}`);
    //   next();
    // });

    // Setup Swagger
    setupSwagger(app);

    // Mount routes with api/v1 prefix
    app.use('/api/v1', routes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      ApiResponse.success(res, {
        message: 'Server is running',
        data: {
          timestamp: new Date(),
          status: 'healthy'
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      logger.debug(`Not Found: ${req.method} ${req.originalUrl}`);
      ApiResponse.error(res, {
        statusCode: 404,
        message: 'Resource not found'
      });
    });

    // Global error handler
    app.use(errorHandler);

    return app;
  } catch (error) {
    logger.error('Error configuring app:', error);
    throw error;
  }
};

module.exports = configureApp;