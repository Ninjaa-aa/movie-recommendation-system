// src/api/v1/movies/movies.routes.js
const express = require('express');
const { validate } = require('../../../middleware/validation.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');
const { authorizeRoles } = require('../../../middleware/role.middleware');
const { upload } = require('../../../middleware/upload.middleware');
const movieValidation = require('./movies.validation');
const movieController = require('./movies.controller');

const router = express.Router();

// Route for creating a movie (admin only, with file upload)
router
  .route('/')
  .post(
    isAuth,
    authorizeRoles('admin'),
    upload.single('coverPhoto'),    // Process file upload for coverPhoto
    validate(movieValidation.createMovie), // Validate the request payload
    movieController.createMovie     // Controller to handle movie creation
  )
  .get(
    validate(movieValidation.getMovies),  // Validate query parameters if any
    movieController.getMovies             // Controller to fetch movies list
  );

// Routes for single movie operations
router
  .route('/:movieId')
  .get(
    movieController.getMovieById          // Controller to fetch movie by ID
  )
  .put(
    isAuth,
    authorizeRoles('admin'),
    upload.single('coverPhoto'),          // Process file upload for coverPhoto
    validate(movieValidation.updateMovie), // Validate the update payload
    movieController.updateMovie           // Controller to handle movie update
  )
  .delete(
    isAuth,
    authorizeRoles('admin'),              // Admin-only access to delete a movie
    movieController.deleteMovie           // Controller to delete movie
  );

module.exports = router;
