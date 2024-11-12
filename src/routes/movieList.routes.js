const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const movieListValidation = require('../validations/movieList.validation');
const movieListController = require('../controllers/movieList.controller');

// Get user's lists
router.get(
  '/',
  isAuth,
  validate({
    query: movieListValidation.getUserLists.query
  }),
  movieListController.getUserLists
);

// Create new list
router.post(
  '/',
  isAuth,
  validate(movieListValidation.createList),
  movieListController.createList
);

// Get public lists
router.get(
  '/public',
  validate(movieListValidation.getPublicLists),
  movieListController.getPublicLists
);

// Get specific list
router.get(
  '/:listId',
  validate(movieListValidation.listId),
  movieListController.getListById
);

// Update list
router.put(
  '/:listId',
  isAuth,
  validate({
    params: movieListValidation.listId.params,
    body: movieListValidation.updateList.body
  }),
  movieListController.updateList
);

// Delete list
router.delete(
  '/:listId',
  isAuth,
  validate(movieListValidation.listId),
  movieListController.deleteList
);

// Add movie to list
router.post(
  '/:listId/movies',
  isAuth,
  validate(movieListValidation.addMovie),
  movieListController.addMovieToList
);

// Remove movie from list
router.delete(
  '/:listId/movies/:movieId',
  isAuth,
  validate(movieListValidation.removeMovie),
  movieListController.removeMovieFromList
);

// Follow list
router.post(
  '/:listId/follow',
  isAuth,
  validate(movieListValidation.listId),
  movieListController.followList
);

// Unfollow list
router.delete(
  '/:listId/follow',
  isAuth,
  validate(movieListValidation.listId),
  movieListController.unfollowList
);

module.exports = router;