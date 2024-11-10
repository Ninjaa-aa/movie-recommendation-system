// src/api/v1/recommendations/recommendation.routes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../../../middleware/auth.middleware');
const {
  getSimilarMovies,
  getPersonalizedRecommendations,
  getTrendingMovies,
  getTopRatedMovies
} = require('./recommendation.controller');

// Similar movies for a specific movie
router.get('/movies/:movieId/similar', getSimilarMovies);

// Personalized recommendations (requires authentication)
router.get('/personalized', isAuth, getPersonalizedRecommendations);

// Trending movies
router.get('/trending', getTrendingMovies);

// Top rated movies
router.get('/top-rated', getTopRatedMovies);

module.exports = router;