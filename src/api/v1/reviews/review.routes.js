// src/api/v1/reviews/review.routes.js
const express = require('express');
const router = express.Router();
const { 
  addReview, 
  updateReview, 
  getMovieReviews, 
  getHighlightedReviews 
} = require('./review.controller');
const { isAuth } = require('../../../middleware/auth.middleware');
const { validateReview } = require('../../../middleware/validation.middleware');

// Movie-specific review routes without '/movies' prefix
router.post('/:movieId/reviews', isAuth, validateReview, addReview);
router.put('/:movieId/reviews', isAuth, validateReview, updateReview);
router.get('/:movieId/reviews', getMovieReviews);

// Highlighted reviews route
router.get('/highlighted', getHighlightedReviews);

module.exports = router;