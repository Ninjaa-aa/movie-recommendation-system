// src/api/v1/wishlist/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { validate, wishlistValidation } = require('../middleware/validation.middleware');
const { verifyToken } = require('../config/jwt');

router.use(verifyToken); // Protect all wishlist routes

// Get routes
router.get('/', wishlistController.getWishlist);
router.get('/available-movies', wishlistController.getAvailableMovies);

// Post route
router.post('/', 
  validate(wishlistValidation.addToWishlist),
  wishlistController.addToWishlist
);

// Put route for updating entire wishlist item
router.put('/:movieId',
  validate(wishlistValidation.updateWishlistItem),
  wishlistController.updateMovieNotes
);

// Patch route for partial updates
router.patch('/:movieId/notes',
  validate(wishlistValidation.updateNotes),
  wishlistController.updateMovieNotes
);

// Delete route
router.delete('/:movieId',
  validate(wishlistValidation.removeFromWishlist),
  wishlistController.removeFromWishlist
);

module.exports = router;