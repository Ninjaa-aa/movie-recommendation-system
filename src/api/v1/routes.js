// src/api/v1/routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const wishlistRoutes = require('./wishlist/wishlist.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wishlist', wishlistRoutes);

module.exports = router;