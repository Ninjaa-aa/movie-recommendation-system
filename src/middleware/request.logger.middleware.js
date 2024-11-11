// src/middlewares/requestLogger.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  logger.info('Incoming Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    logger.info('Outgoing Response:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      body: data
    });
    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;