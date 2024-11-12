// src/api/v1/news/news.routes.js
const express = require('express');
const { isAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { upload } = require('../middleware/upload.middleware');
const newsValidation = require('../validations/news.validation');
const newsController = require('../controllers/news.controller');

const router = express.Router();

// Public routes
router.get(
  '/',
  validate(newsValidation.getNews),
  newsController.getNews
);

router.get(
  '/trending',
  validate(newsValidation.getTrendingNews),
  newsController.getTrendingNews
);

router.get(
  '/id/:newsId',
  validate(newsValidation.getNewsById),
  newsController.getNewsById
);

router.get(
  '/slug/:slug',
  validate(newsValidation.getNewsBySlug),
  newsController.getNewsBySlug
);

router.get(
  '/:newsId/related',
  validate(newsValidation.getRelatedNews),
  newsController.getRelatedNews
);

// Protected routes (admin only)
router.post(
  '/',
  isAuth,
  authorizeRoles('admin'),
  upload.single('coverImage'),
  validate(newsValidation.createNews),
  newsController.createNews
);

router.put(
  '/:newsId',
  isAuth,
  authorizeRoles('admin'),
  upload.single('coverImage'),
  validate(newsValidation.updateNews),
  newsController.updateNews
);

router.delete(
  '/:newsId',
  isAuth,
  authorizeRoles('admin'),
  validate(newsValidation.deleteNews),
  newsController.deleteNews
);

module.exports = router;