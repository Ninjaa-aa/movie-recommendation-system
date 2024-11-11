// src/api/v1/community/index.js
const communityRoutes = require('./community.routes');
const communityController = require('./community.controller');
const communityValidation = require('./community.validation');

module.exports = {
  communityRoutes,
  communityController,
  communityValidation
};