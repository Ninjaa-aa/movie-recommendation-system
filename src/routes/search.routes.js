// src/api/v1/search/search.routes.js
const express = require('express');
const { validate } = require('../middleware/validation.middleware');
const searchValidation = require('../validations/search.validation');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get(
  '/movies',
  validate(searchValidation.searchMovies),
  searchController.searchMovies
);

router.get(
  '/top-movies',
  validate(searchValidation.getTopMovies),
  searchController.getTopMovies
);

module.exports = router;