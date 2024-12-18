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
    const baseSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger.yaml'));
    const authSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/auth.yaml'));
    const usersSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/users.yaml'));
    const wishlistSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/wishlist.yaml'));
    const moviesSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/movies.yaml'));
    const ratingReviewSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/rating-review.yaml'));
    const recommendationSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/recommendation.yaml'));
    const movieListSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/movie-list.yaml'));
    const searchSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/search.yaml'));
    const releaseNotificationSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/release-notification.yaml'));
    const newsSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/news.yaml'));
    const boxOfficeSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/box-office.yaml'));
    const awardSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/award.yaml'));
    const communitySwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/community.yaml'));
    const adminSwagger = loadYamlFile(path.join(__dirname, '../docs/swagger/admin.yaml'));

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
        { name: 'Recommendations', description: 'Movie recommendation endpoints' },
        { name: 'Movie Lists', description: 'Movie list management endpoints' },
        { name: 'Search', description: 'Search endpoints' },
        { name: 'Release Notifications', description: 'Release notification endpoints' },
        { name: 'News', description: 'News article endpoints' },
        { name: 'Box Office', description: 'Box office endpoints' },
        { name: 'Awards', description: 'Award endpoints' },
        { name: 'Community', description: 'Community endpoints' },
        { name: 'Admin', description: 'Admin endpoints' }
      ],
      paths: {
        ...(authSwagger.paths || {}),
        ...(usersSwagger.paths || {}),
        ...(wishlistSwagger.paths || {}),
        ...(moviesSwagger.paths || {}),
        ...(ratingReviewSwagger.paths || {}),
        ...(recommendationSwagger.paths || {}),
        ...(movieListSwagger.paths || {}),
        ...(searchSwagger.paths || {}),
        ...(releaseNotificationSwagger.paths || {}),
        ...(newsSwagger.paths || {}),
        ...(boxOfficeSwagger.paths || {}),
        ...(awardSwagger.paths || {}),
        ...(communitySwagger.paths || {}),
        ...(adminSwagger.paths || {})
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
          ...(recommendationSwagger.components?.schemas || {}),
          ...(movieListSwagger.components?.schemas || {}),
          ...(searchSwagger.components?.schemas || {}),
          ...(releaseNotificationSwagger.components?.schemas || {}),
          ...(newsSwagger.components?.schemas || {}),
          ...(boxOfficeSwagger.components?.schemas || {}),
          ...(awardSwagger.components?.schemas || {}),
          ...(communitySwagger.components?.schemas || {}),
          ...(adminSwagger.components?.schemas || {})
        },
        responses: {
          ...(baseSwagger.components?.responses || {}),
          ...(authSwagger.components?.responses || {}),
          ...(usersSwagger.components?.responses || {}),
          ...(wishlistSwagger.components?.responses || {}),
          ...(moviesSwagger.components?.responses || {}),
          ...(ratingReviewSwagger.components?.responses || {}),
          ...(recommendationSwagger.components?.responses || {}),
          ...(movieListSwagger.components?.responses || {}),
          ...(searchSwagger.components?.responses || {}),
          ...(releaseNotificationSwagger.components?.responses || {}),
          ...(newsSwagger.components?.responses || {}),
          ...(boxOfficeSwagger.components?.responses || {}),
          ...(awardSwagger.components?.responses || {}),
          ...(communitySwagger.components?.responses || {}),
          ...(adminSwagger.components?.responses || {})
        }
      }
    };

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
