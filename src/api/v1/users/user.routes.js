// src/api/v1/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken } = require('../../../config/jwt');
const validate = require('../../../middleware/validation.middleware');
const userValidation = require('./user.validation');

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/profile', userController.getProfile);

router.put('/profile',
  validate(userValidation.updateProfile),
  userController.updateProfile
);

router.put('/preferences',
  validate(userValidation.updatePreferences),
  userController.updatePreferences
);

module.exports = router;