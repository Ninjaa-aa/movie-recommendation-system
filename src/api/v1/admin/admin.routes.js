// src/api/v1/admin/admin.routes.js
const express = require('express');
const { validate } = require('../../../middleware/validation.middleware');
const adminValidation = require('./admin.validation');
const adminController = require('./admin.controller');

const { authorizeRoles } = require('../../../middleware/role.middleware');
const router = express.Router();

// Ensure all routes require admin privileges
router.use(authorizeRoles('admin'));

// Analytics Routes
router.get(
  '/stats/overall',
  validate(adminValidation.getStats),
  adminController.getOverallStats
);

router.get(
  '/stats/users',
  validate(adminValidation.getStats),
  adminController.getUserStats
);

router.get(
  '/stats/movies',
  validate(adminValidation.getStats),
  adminController.getMovieStats
);

router.get(
  '/stats/engagement',
  validate(adminValidation.getStats),
  adminController.getEngagementStats
);

router.get(
  '/stats/genres',
  validate(adminValidation.getStats),
  adminController.getGenreStats
);

router.get(
  '/stats/actors',
  validate(adminValidation.getStats),
  adminController.getActorStats
);

// Moderation Routes
router.get(
  '/moderation/queue',
  validate(adminValidation.getModerationQueue),
  adminController.getModerationQueue
);

router.post(
  '/moderation/:itemId',
  validate(adminValidation.moderateContent),
  adminController.moderateContent
);

module.exports = router;