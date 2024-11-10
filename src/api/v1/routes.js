// src/api/v1/routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const wishlistRoutes = require('./wishlist/wishlist.routes');
const movieRoutes = require('./movies/movies.routes');
const recommendationRoutes = require('./recommendations/recommendation.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/movies', movieRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router;