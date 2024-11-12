// src/api/v1/admin/admin.routes.js
const express = require('express');
const { validate } = require('../../../middleware/validation.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');  // Import isAuth properly
const { authorizeRoles } = require('../../../middleware/role.middleware');
const adminController = require('./admin.controller');
const adminValidation = require('./admin.validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(isAuth);
// Apply admin role check to all routes
router.use(authorizeRoles('admin'));

// Movie and Review Moderation
router.get(
  '/moderation',
  adminController.getMovieModeration
);

router.patch(
  '/moderation/review/:reviewId',
  validate(adminValidation.moderateReview),
  adminController.moderateReview
);

// Statistics
router.get(
  '/statistics',
  validate(adminValidation.getStatistics),
  adminController.getSiteStatistics
);

module.exports = router;