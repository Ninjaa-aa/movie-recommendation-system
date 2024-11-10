// src/api/v1/movieList/movieList.routes.js
const express = require('express');
const router = express.Router();
const movieListController = require('./movieList.controller');
const { verifyToken } = require('../../../config/jwt');
const { validate } = require('../../../middleware/validation.middleware');
const movieListValidation = require('./movieList.validation');

// Public routes
router.get('/public', validate(movieListValidation.getPublicLists, 'query'), movieListController.getPublicLists);

// Protected routes
router.use(verifyToken);

router.post('/', 
  validate(movieListValidation.createList),
  movieListController.createList
);

router.get('/', 
  validate(movieListValidation.getUserLists, 'query'),
  movieListController.getUserLists
);

router.get('/:listId',
  validate(movieListValidation.listId, 'params'),
  movieListController.getListById
);

router.put('/:listId',
  validate(movieListValidation.listId, 'params'),
  validate(movieListValidation.updateList),
  movieListController.updateList
);

router.delete('/:listId',
  validate(movieListValidation.listId, 'params'),
  movieListController.deleteList
);

// router.get(
//   '/user/:userId?',
//   validate(movieListValidation.getUserLists),
//   movieListController.getUserLists
// );

router.post('/:listId/movies',
  validate(movieListValidation.listId, 'params'),
  validate(movieListValidation.addMovie),
  movieListController.addMovieToList
);

router.delete('/:listId/movies/:movieId',
  validate(movieListValidation.listId, 'params'),
  validate(movieListValidation.movieId, 'params'),
  movieListController.removeMovieFromList
);

router.post('/:listId/follow',
  validate(movieListValidation.listId, 'params'),
  movieListController.followList
);

router.delete('/:listId/follow',
  validate(movieListValidation.listId, 'params'),
  movieListController.unfollowList
);

module.exports = router;