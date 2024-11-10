// api/v1/movies/movies.controller.js
const movieService = require('./movies.sevices');
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');

class MovieController {
  createMovie = catchAsync(async (req, res) => {
    const movie = await movieService.createMovie(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Movie created successfully',
      data: movie
    });
  });

  updateMovie = catchAsync(async (req, res) => {
    const movie = await movieService.updateMovie(req.params.movieId, req.body);
    return ApiResponse.success(res, {
      message: 'Movie updated successfully',
      data: movie
    });
  });

  deleteMovie = catchAsync(async (req, res) => {
    const result = await movieService.deleteMovie(req.params.movieId);
    return ApiResponse.success(res, {
      message: result.message
    });
  });

  getMovieById = catchAsync(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.movieId);
    return ApiResponse.success(res, {
      message: 'Movie retrieved successfully',
      data: movie
    });
  });

  getMovies = catchAsync(async (req, res) => {
    const result = await movieService.getMovies(req.query);
    return ApiResponse.success(res, {
      message: 'Movies retrieved successfully',
      data: result
    });
  });
}

module.exports = new MovieController();