// src/api/v1/wishlist/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('./wishlist.controller');
const { verifyToken } = require('../../../config/jwt');
const { validate } = require('../../../middleware/validation.middleware');
const wishlistValidation = require('./wishlist.validation');

// All routes require authentication
router.use(verifyToken);

// Get wishlist
router.get('/', wishlistController.getWishlist);

// Get available movies for wishlist
router.get('/available-movies', wishlistController.getAvailableMovies);

// Add movie to wishlist
router.post('/',
  validate(wishlistValidation.addMovie),
  wishlistController.addToWishlist
);

// Remove movie from wishlist
router.delete('/:movieId',
  validate(wishlistValidation.params, 'params'),
  wishlistController.removeFromWishlist
);

// Update movie notes/priority
router.put('/:movieId',
  validate(wishlistValidation.params, 'params'),
  validate(wishlistValidation.updateMovie),
  wishlistController.updateMovieNotes
);

module.exports = router;