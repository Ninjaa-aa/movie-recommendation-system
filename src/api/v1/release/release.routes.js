// src/api/v1/release/release.routes.js
const express = require('express');
const { isAuth } = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const releaseValidation = require('./release.validation');
const releaseController = require('./release.controller');

const router = express.Router();

// Get upcoming releases (public route)
router.get(
  '/upcoming',
  validate(releaseValidation.getUpcomingReleases),
  releaseController.getUpcomingReleases
);

// Set reminder (authenticated route)
router.post(
  '/reminder',
  isAuth,
  validate(releaseValidation.setReminder),
  releaseController.setReminder
);

// Get user's reminders (authenticated route)
router.get(
  '/reminders',
  isAuth,
  validate(releaseValidation.getUserReminders),
  releaseController.getUserReminders
);

// Cancel reminder (authenticated route)
router.delete(
  '/reminder/:movieId/:type',
  isAuth,
  validate(releaseValidation.cancelReminder),
  releaseController.cancelReminder
);

module.exports = router;