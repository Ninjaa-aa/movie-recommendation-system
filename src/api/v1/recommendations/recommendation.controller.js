// src/api/v1/recommendations/recommendation.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const recommendationService = require('./recommendation.service');

const getSimilarMovies = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const { limit = 10 } = req.query;

  const movies = await recommendationService.getSimilarMovies(movieId, parseInt(limit));

  return ApiResponse.success(res, {
    message: 'Similar movies retrieved successfully',
    data: movies
  });
});

const getPersonalizedRecommendations = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const recommendations = await recommendationService.getPersonalizedRecommendations(
    userId,
    parseInt(page),
    parseInt(limit)
  );

  return ApiResponse.success(res, {
    message: 'Personalized recommendations retrieved successfully',
    data: recommendations
  });
});

const getTrendingMovies = catchAsync(async (req, res) => {
  const { period = 'weekly', page = 1, limit = 10 } = req.query;

  const trending = await recommendationService.getTrendingMovies(
    period,
    parseInt(page),
    parseInt(limit)
  );

  return ApiResponse.success(res, {
    message: 'Trending movies retrieved successfully',
    data: trending
  });
});

const getTopRatedMovies = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const topRated = await recommendationService.getTopRatedMovies(
    parseInt(page),
    parseInt(limit)
  );

  return ApiResponse.success(res, {
    message: 'Top rated movies retrieved successfully',
    data: topRated
  });
});

module.exports = {
  getSimilarMovies,
  getPersonalizedRecommendations,
  getTrendingMovies,
  getTopRatedMovies
};