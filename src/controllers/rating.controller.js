// src/api/v1/ratings/rating.controller.js
const RatingService = require('../services/rating.service');
const { ApiResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');

const addRating = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  const newRating = await RatingService.createRating(userId, movieId, rating);
  
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Rating added successfully',
    data: newRating
  });
});

const updateRating = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  const updatedRating = await RatingService.updateRating(userId, movieId, rating);
  
  return ApiResponse.success(res, {
    message: 'Rating updated successfully',
    data: updatedRating
  });
});

const getMovieRatings = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const ratings = await RatingService.getMovieRatings(movieId, page, limit);
  
  return ApiResponse.success(res, {
    message: 'Ratings retrieved successfully',
    data: ratings
  });
});

module.exports = {
  addRating,
  updateRating,
  getMovieRatings
};
