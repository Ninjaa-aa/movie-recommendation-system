// src/api/v1/search/search.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const searchService = require('../services/search.service');

const searchMovies = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  // Parse arrays from query string
  if (filters.genre && typeof filters.genre === 'string') {
    filters.genre = filters.genre.split(',').map(g => g.trim());
  }
  if (filters.ageRating && typeof filters.ageRating === 'string') {
    filters.ageRating = filters.ageRating.split(',').map(r => r.trim());
  }

  const results = await searchService.searchMovies(filters, page, limit);

  return ApiResponse.success(res, {
    message: 'Movies retrieved successfully',
    data: results
  });
});

const getTopMovies = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, period, genre, type } = req.query;
  const results = await searchService.getTopMovies(
    { period, genre, type },
    page,
    limit
  );

  return ApiResponse.success(res, {
    message: 'Top movies retrieved successfully',
    data: results
  });
});

module.exports = {
  searchMovies,
  getTopMovies
};