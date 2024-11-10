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

    // Serve static files from public directory
    app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    });
    app.use('/api', limiter);

    // Setup Swagger
    setupSwagger(app);

    // Routes
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