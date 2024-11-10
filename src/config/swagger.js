// src/config/swagger.js
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const logger = require('../utils/logger');

// Helper function to load YAML files
const loadYamlFile = (filePath) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    logger.error(`Error loading YAML file ${filePath}:`, error);
    return {}; // Return empty object to prevent crashes
  }
};

const setupSwagger = (app) => {
  try {
    // Load Swagger documents with error handling
    const baseSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/base.yaml'));
    const authSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/auth.yaml'));
    const usersSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/users.yaml'));
    const wishlistSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/wishlist.yaml'));
    const moviesSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/movies.yaml'));
    const ratingReviewSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/rating-review.yaml'));
    const recommendationSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/recommendation.yaml'));

    // Log loaded paths for debugging
    // logger.debug('Loaded paths:', {
    //   auth: Object.keys(authSwagger.paths || {}),
    //   users: Object.keys(usersSwagger.paths || {}),
    //   wishlist: Object.keys(wishlistSwagger.paths || {}),
    //   movies: Object.keys(moviesSwagger.paths || {}),
    //   ratingReview: Object.keys(ratingReviewSwagger.paths || {})
    // });

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
        { name: 'Wishlist', description: 'Wishlist management endpoints' },
        { name: 'Movies', description: 'Movie management endpoints' },
        { name: 'Ratings', description: 'Movie rating endpoints' },
        { name: 'Reviews', description: 'Movie review endpoints' },
        { name: 'Recommendations', description: 'Movie recommendation endpoints' }
      ],
      paths: {
        ...(authSwagger.paths || {}),
        ...(usersSwagger.paths || {}),
        ...(wishlistSwagger.paths || {}),
        ...(moviesSwagger.paths || {}),
        ...(ratingReviewSwagger.paths || {}),
        ...(recommendationSwagger.paths || {})
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
          ...(wishlistSwagger.components?.schemas || {}),
          ...(moviesSwagger.components?.schemas || {}),
          ...(ratingReviewSwagger.components?.schemas || {}),
          ...(recommendationSwagger.components?.schemas || {})
        },
        responses: {
          ...(baseSwagger.components?.responses || {}),
          ...(authSwagger.components?.responses || {}),
          ...(usersSwagger.components?.responses || {}),
          ...(wishlistSwagger.components?.responses || {}),
          ...(moviesSwagger.components?.responses || {}),
          ...(ratingReviewSwagger.components?.responses || {}),
          ...(recommendationSwagger.components?.responses || {})
        }
      }
    };

    // // Log final paths for debugging
    // logger.debug('Final swagger paths:', Object.keys(swaggerDocument.paths));

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
  } catch (error) {
    logger.error('Error setting up Swagger:', error);
  }
};

module.exports = { setupSwagger };