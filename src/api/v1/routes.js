// src/api/v1/routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const wishlistRoutes = require('./wishlist/wishlist.routes');
const movieRoutes = require('./movies/movies.routes');
const recommendationRoutes = require('./recommendations/recommendation.routes');
const movieListRoutes = require('./movieList/movieList.routes');
const searchRoutes = require('./search/search.routes');
const releaseRoutes = require('./release/release.routes');
const notificationRoutes = require('./notification/notification.routes');


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/movies', movieRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/movie-lists', movieListRoutes);
router.use('/search', searchRoutes);
router.use('/releases', releaseRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;