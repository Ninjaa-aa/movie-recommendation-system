// src/api/v1/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../../config/jwt');
const { validate } = require('../../../middleware/validation.middleware');
const authValidation = require('./auth.validation');

// Public routes
router.post('/register',
  validate(authValidation.register),
  authController.register
);

router.post('/login',
  validate(authValidation.login),
  authController.login
);

// Protected routes
router.get('/me',
  verifyToken,
  authController.getMe
);

module.exports = router;