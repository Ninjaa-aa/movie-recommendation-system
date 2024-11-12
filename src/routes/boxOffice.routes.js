// src/api/v1/box-office/boxOffice.routes.js
const express = require('express');
const { validate } = require('../middleware/validation.middleware');
const {isAuth} = require('../middleware/auth.middleware');
const boxOfficeValidation = require('../validations/boxOffice.validation');
const boxOfficeController = require('../controllers/boxOffice.controller');
const { authorizeRoles } = require('../middleware/role.middleware');
const router = express.Router();

// Public routes
router.get(
  '/top-grossing',
  validate(boxOfficeValidation.getTopGrossing),
  boxOfficeController.getTopGrossing
);

router.get(
  '/weekly-trends',
  boxOfficeController.getWeeklyTrends
);

router.get(
  '/movies/:movieId/box-office',
  validate(boxOfficeValidation.getBoxOffice),
  boxOfficeController.getBoxOffice
);

// Protected routes
router.post(
  '/movies/:movieId/box-office',
  isAuth,
//   authorizeRoles('admin'),
  validate(boxOfficeValidation.createBoxOffice),
  boxOfficeController.createBoxOffice
);

router.put(
  '/movies/:movieId/box-office',
  isAuth,
//   authorizeRoles('admin'),
  validate(boxOfficeValidation.updateBoxOffice),
  boxOfficeController.updateBoxOffice
);

module.exports = router;