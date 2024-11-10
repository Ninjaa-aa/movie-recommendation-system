// src/utils/logger.js
const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error && error.stack) {
      console.error('[ERROR STACK]:', error.stack);
    }
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  debug: (message, data) => {
  //  console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data) {
     // console.debug('[DEBUG DATA]:', data);
    }
  }
};

module.exports = logger;