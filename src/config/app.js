const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../api/v1/routes');
const errorHandler = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { setupSwagger } = require('./swagger');
const configureBodyParser = require('../middleware/body-parser.middleware');

const configureApp = (app) => {
  // Basic middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup Swagger
  setupSwagger(app);

  configureBodyParser(app);

  console.log('=== Award Route Accessed ===');
  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      logger.debug('Request body:', req.body);
    }
    next();
  });

  // API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use((req, res) => {
    logger.debug(`Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

module.exports = configureApp;