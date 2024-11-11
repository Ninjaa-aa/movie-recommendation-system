// src/api/v1/boxOffice/boxOffice.routes.js
const express = require('express');
const { isAuth } = require('../../../middleware/auth.middleware');
const { authorizeRoles } = require('../../../middleware/role.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const boxOfficeValidation = require('./boxOffice.validation');
const boxOfficeController = require('./boxOffice.controller');

const router = express.Router();

router.get(
  '/top-grossing',
  validate(boxOfficeValidation.getTopGrossing),
  boxOfficeController.getTopGrossing
);

router.get(
  '/weekly-trends',
  boxOfficeController.getWeeklyTrends
);

router.post(
  '/movies/:movieId/box-office',
  isAuth,
  authorizeRoles('admin'),
  validate(boxOfficeValidation.createBoxOffice),
  boxOfficeController.createBoxOffice
);

router.put(
  '/movies/:movieId/box-office',
  isAuth,
  authorizeRoles('admin'),
  validate(boxOfficeValidation.updateBoxOffice),
  boxOfficeController.updateBoxOffice
);

router.get(
  '/movies/:movieId/box-office',
  validate(boxOfficeValidation.getBoxOfficeByMovie),
  boxOfficeController.getBoxOfficeByMovie
);

module.exports = router;