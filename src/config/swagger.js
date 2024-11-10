// src/config/swagger.js
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const logger = require('../utils/logger');

const loadYamlFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const doc = YAML.load(filePath);
      logger.info(`Loaded swagger file: ${filePath}`);
      return doc;
    }
    logger.warn(`Swagger file not found: ${filePath}`);
    return {};
  } catch (error) {
    logger.error(`Error loading swagger file ${filePath}:`, error);
    return {};
  }
};

const setupSwagger = (app) => {
  // Load Swagger documents with error handling
  const baseSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/base.yaml'));
  const authSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/auth.yaml'));
  const usersSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/users.yaml')); // Changed from user.yaml to users.yaml
  const wishlistSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/wishlist.yaml'));

  // Log loaded paths for debugging
  logger.debug('Loaded paths:', {
    auth: Object.keys(authSwagger.paths || {}),
    users: Object.keys(usersSwagger.paths || {}),
    wishlist: Object.keys(wishlistSwagger.paths || {})
  });

  // Combine all swagger documents
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Movie Recommendation System API',
      version: '1.0.0',
      description: 'API documentation for Movie Recommendation System'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Wishlist', description: 'Wishlist management endpoints' }
    ],
    paths: {
      ...(authSwagger.paths || {}),
      ...(usersSwagger.paths || {}),
      ...(wishlistSwagger.paths || {})
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ...(baseSwagger.components?.schemas || {}),
        ...(authSwagger.components?.schemas || {}),
        ...(usersSwagger.components?.schemas || {}),
        ...(wishlistSwagger.components?.schemas || {})
      },
      responses: {
        ...(baseSwagger.components?.responses || {}),
        ...(authSwagger.components?.responses || {}),
        ...(usersSwagger.components?.responses || {}),
        ...(wishlistSwagger.components?.responses || {})
      }
    }
  };

  // Log final paths for debugging
  logger.debug('Final swagger paths:', Object.keys(swaggerDocument.paths));

  // Disable helmet for swagger path
  app.use('/api-docs', (req, res, next) => {
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })(req, res, next);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Movie Recommendation API Documentation",
    swaggerOptions: {
      persistAuthorization: true
    }
  }));
};

module.exports = { setupSwagger };