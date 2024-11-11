// src/api/v1/awards/award.routes.js
const express = require('express');
const { isAuth } = require('../../../middleware/auth.middleware');
const { authorizeRoles } = require('../../../middleware/role.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const awardValidation = require('./award.validation');
const awardController = require('./award.controller');
const logger = require('../../../utils/logger');
const router = express.Router();


// Logging middleware specific to awards
router.use((req, res, next) => {
  logger.info('Awards route accessed');
  next();
});

// Create award route
router.post('/', 
  (req, res, next) => {
    logger.debug('Request body:', req.body);
    next();
  },
  awardController.createAward
);

// router.post(
//   '/',
//   // isAuth,
//   // authorizeRoles('admin'),
//   validate(awardValidation.createAward),
//   (req, res, next) => {
//     console.log('Route middleware reached');
//     next();
//   },
//   awardController.createAward
// );

router.put(
  '/:awardId',
  isAuth,
  authorizeRoles('admin'),
  validate(awardValidation.updateAward),
  awardController.updateAward
);

router.get(
  '/search',
  validate(awardValidation.searchAwards),
  awardController.searchAwards
);

router.get(
  '/by-year',
  validate(awardValidation.getAwardsByYear),
  awardController.getAwardsByYear
);

router.get(
  '/winners',
  validate(awardValidation.getAwardWinners),
  awardController.getAwardWinners
);

router.get(
  '/movies/:movieId',
  validate(awardValidation.getMovieAwards),
  awardController.getMovieAwards
);

module.exports = router;