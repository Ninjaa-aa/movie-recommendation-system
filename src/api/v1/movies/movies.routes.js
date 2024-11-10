// src/api/v1/movies/movies.routes.js
const express = require('express');
const router = express.Router();
const { validate } = require('../../../middleware/validation.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');
const { authorizeRoles } = require('../../../middleware/role.middleware');
const { upload } = require('../../../middleware/upload.middleware');
const { validateRating, validateReview } = require('../../../middleware/validation.middleware');
const movieValidation = require('./movies.validation');
const movieController = require('./movies.controller');
const ratingController = require('../ratings/rating.controller');
const reviewController = require('../reviews/review.controller');

// Rating routes
router.post('/:movieId/ratings', isAuth, validateRating, ratingController.addRating);
router.put('/:movieId/ratings', isAuth, validateRating, ratingController.updateRating);
router.get('/:movieId/ratings', ratingController.getMovieRatings);

// Review routes
router.post('/:movieId/reviews', isAuth, validateReview, reviewController.addReview);
router.put('/:movieId/reviews', isAuth, validateReview, reviewController.updateReview);
router.get('/:movieId/reviews', reviewController.getMovieReviews);

// Highlighted reviews route
router.get('/reviews/highlighted', reviewController.getHighlightedReviews);

// Basic movie routes
router.post('/', 
  isAuth, 
  authorizeRoles('admin'), 
  upload.single('coverPhoto'),
  validate(movieValidation.createMovie),
  movieController.createMovie
);

router.get('/', 
  validate(movieValidation.getMovies),
  movieController.getMovies
);

// Single movie operations
router.get('/:movieId', movieController.getMovieById);

router.put('/:movieId',
  isAuth,
  authorizeRoles('admin'),
  upload.single('coverPhoto'),
  validate(movieValidation.updateMovie),
  movieController.updateMovie
);

router.delete('/:movieId',
  isAuth,
  authorizeRoles('admin'),
  movieController.deleteMovie
);

module.exports = router;