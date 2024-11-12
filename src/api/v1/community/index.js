// src/api/v1/community/index.js
const communityRoutes = require('../../../routes/community.routes');
const communityController = require('./community.controller');
const communityValidation = require('../../../validations/community.validation');

module.exports = {
  communityRoutes,
  communityController,
  communityValidation
};