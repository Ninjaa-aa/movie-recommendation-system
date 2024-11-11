const express = require('express');
const { validate } = require('../../../middleware/validation.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');
const awardValidation = require('./award.validation');
const awardController = require('./award.controller');
const { authorizeRoles } = require('../../../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/by-year', 
  validate(awardValidation.getAwardsByYear), 
  awardController.getAwardsByYear
);

router.get('/winners', 
  validate(awardValidation.getAwardWinners), 
  awardController.getAwardWinners
);

router.get('/search', 
  validate(awardValidation.searchAwards), 
  awardController.searchAwards
);

router.get('/movie/:movieId', 
  validate(awardValidation.getMovieAwards), 
  awardController.getMovieAwards
);

router.get('/movie/:movieId/major-stats', 
  validate(awardValidation.getMovieAwards), 
  awardController.getMajorAwardStats
);

// // Protected routes
router.post('/', 
  isAuth,
  authorizeRoles('admin'),
  validate(awardValidation.createAward),  // Uncommented and properly structured
  awardController.createAward
);

router.patch('/:awardId', 
  isAuth,
  authorizeRoles('admin'),
  validate(awardValidation.updateAward),  // Uncommented and properly structured
  awardController.updateAward
);

router.delete('/:awardId', 
  isAuth,
  authorizeRoles('admin'),
  validate(awardValidation.deleteAward),  // Uncommented and properly structured
  awardController.deleteAward
);

module.exports = router;