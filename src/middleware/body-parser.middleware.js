// src/middleware/body-parser.middleware.js
const express = require('express');
const logger = require('../utils/logger');

const configureBodyParser = (app) => {
  // JSON body parser with error handling
  app.use(express.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        logger.error('Invalid JSON:', e);
        res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          error: {
            details: e.message
          }
        });
        throw new Error('Invalid JSON');
      }
    },
    limit: '10mb'
  }));

  // URL-encoded parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Add raw body parsing for debugging
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
      let data = '';
      
      req.setEncoding('utf8');
      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          // Store raw and parsed body for debugging
          req.rawBody = data;
          req.parsedBody = JSON.parse(data);
          next();
        } catch (error) {
          logger.error('Error parsing JSON body:', error);
          res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body',
            error: {
              details: error.message,
              receivedData: data
            }
          });
        }
      });
    } else {
      next();
    }
  });
};

module.exports = configureBodyParser;