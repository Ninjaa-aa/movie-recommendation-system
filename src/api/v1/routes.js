// src/api/v1/routes.js
const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const wishlistRoutes = require('./wishlist/wishlist.routes');
const movieRoutes = require('./movies/movies.routes');
const recommendationRoutes = require('./recommendations/recommendation.routes');
const movieListRoutes = require('./movieList/movieList.routes');
const searchRoutes = require('./search/search.routes');
const releaseRoutes = require('./release/release.routes');
const notificationRoutes = require('./notification/notification.routes');
const newsRoutes = require('./news/news.routes');
const boxOfficeRoutes = require('./boxOffice/boxOffice.routes');
const awardRoutes = require('./awards/award.routes');

// Logging middleware for all routes
router.use((req, res, next) => {
  logger.info(`API Request: ${req.method} ${req.path}`);
  logger.debug('Request body:', req.body);
  next();
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/movies', movieRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/movie-lists', movieListRoutes);
router.use('/search', searchRoutes);
router.use('/releases', releaseRoutes);
router.use('/notifications', notificationRoutes);
router.use('/news', newsRoutes);
router.use('/box-office', boxOfficeRoutes);
router.use('/awards', (req, res, next) => {
    console.log('=== Award Route Accessed ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    next();  // Ensure next() is called to pass control to the next middleware
}, awardRoutes);


module.exports = router;