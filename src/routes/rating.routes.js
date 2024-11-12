// src/api/v1/ratings/rating.routes.js
const express = require('express');
const router = express.Router();
const { addRating, updateRating, getMovieRatings } = require('./rating.controller');
const { isAuth } = require('../middleware/auth.middleware');
const { validateRating } = require('../middleware/validation.middleware');

router.post('/:movieId/ratings', isAuth, validateRating, addRating);
router.put('/:movieId/ratings', isAuth, validateRating, updateRating);
router.get('/:movieId/ratings', getMovieRatings);

module.exports = router;