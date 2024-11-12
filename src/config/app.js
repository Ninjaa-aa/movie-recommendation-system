const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../routes/routes');
const errorHandler = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { setupSwagger } = require('./swagger');

const configureApp = (app) => {
  // Basic middleware configuration
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' // Enable CSP in production
  }));
  
  // Configure CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parser configuration
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
  }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      logger.debug('Request body:', req.body);
    }
    next();
  });

  // Setup Swagger documentation
  setupSwagger(app);

  // API routes
  app.use('/api/v1', routes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return app;
};

module.exports = configureApp;
