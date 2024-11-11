// src/utils/logger.js
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log('[INFO DATA]:', JSON.stringify(data, null, 2));
    }
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error('[ERROR DETAILS]:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('[ERROR DETAILS]:', error);
      }
    }
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.warn('[WARN DATA]:', JSON.stringify(data, null, 2));
    }
  },
  debug: (message, data) => {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.debug('[DEBUG DATA]:', JSON.stringify(data, null, 2));
    }
  }
};

module.exports = logger;