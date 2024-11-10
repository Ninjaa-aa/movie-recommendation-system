// src/api/v1/wishlist/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('./wishlist.controller');
const { verifyToken } = require('../../../config/jwt');
const { validate } = require('../../../middleware/validation.middleware');
const wishlistValidation = require('./wishlist.validation');

// All routes require authentication
router.use(verifyToken);

router.get('/', wishlistController.getWishlist);

router.post('/',
  validate(wishlistValidation.addMovie),
  wishlistController.addToWishlist
);

router.delete('/:movieId',
  validate(wishlistValidation.params, 'params'),
  wishlistController.removeFromWishlist
);

router.put('/:movieId',
  validate(wishlistValidation.params, 'params'),
  validate(wishlistValidation.updateMovie),
  wishlistController.updateMovieNotes
);

module.exports = router;