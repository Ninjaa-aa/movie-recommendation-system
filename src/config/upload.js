// src/config/upload.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const createUploadDirectories = () => {
  const directories = [
    'public',
    'public/uploads',
    'public/uploads/movies'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        logger.info(`Created directory: ${fullPath}`);
      } catch (error) {
        logger.error(`Error creating directory ${fullPath}:`, error);
        throw error;
      }
    }
  });
};

module.exports = { createUploadDirectories };