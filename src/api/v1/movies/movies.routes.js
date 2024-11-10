// src/api/v1/movies/movies.routes.js
const express = require('express');
const { validate } = require('../../../middleware/validation.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');
const { authorizeRoles } = require('../../../middleware/role.middleware');
const movieValidation = require('./movies.validation');
const movieController = require('./movies.controller');

const router = express.Router();

// Route for creating a movie (restricted to admin)
router.post(
  '/',
  isAuth,
  authorizeRoles('admin'),
  validate(movieValidation.createMovie),
  movieController.createMovie
);

// Route for fetching all movies
router.get(
  '/',
  validate(movieValidation.getMovies),
  movieController.getMovies
);

// Route for getting a single movie by ID
router.get(
  '/:movieId',
  movieController.getMovieById
);

// Route for updating a movie (restricted to admin)
router.put(
  '/:movieId',
  isAuth,
  authorizeRoles('admin'),
  validate(movieValidation.updateMovie),
  movieController.updateMovie
);

// Route for deleting a movie (restricted to admin)
router.delete(
  '/:movieId',
  isAuth,
  authorizeRoles('admin'),
  movieController.deleteMovie
);

module.exports = router;
