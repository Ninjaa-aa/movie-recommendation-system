// src/api/v1/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../config/jwt');
const { validate } = require('../middleware/validation.middleware');
const userValidation = require('../validations/user.validation');
const {isAdmin } = require('../middleware/role.middleware');

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/profile', userController.getProfile);

router.put('/profile',
  validate(userValidation.updateProfile),
  userController.updateProfile
);

// Preferences routes
router.put('/preferences',
  validate(userValidation.updatePreferences),
  userController.updatePreferences
);

// Admin routes
router.get('/',
  isAdmin,
  validate(userValidation.getUsers),
  userController.getUsers
);

module.exports = router;