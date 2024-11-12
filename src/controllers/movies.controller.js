// src/api/v1/movies/movies.controller.js
const movieService = require('../services/movies.service');
const { ApiResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');
const fs = require('fs').promises;
const path = require('path');

class MovieController {
  createMovie = catchAsync(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'Cover photo is required'
      });
    }

    const movieData = {
      ...req.body,
      coverPhoto: {
        fileName: req.file.filename,
        filePath: `/uploads/movies/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    };

    const movie = await movieService.createMovie(movieData);

    // Update box office stats if budget is provided
    if (movieData.production?.budget?.amount) {
      await movie.updateBoxOfficeStats();
    }

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Movie created successfully',
      data: movie
    });
  });

  updateMovie = catchAsync(async (req, res) => {
    const { movieId } = req.params;
    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      const oldMovie = await movieService.getMovieById(movieId);
      
      if (oldMovie.coverPhoto?.filePath) {
        const oldImagePath = path.join('public', oldMovie.coverPhoto.filePath);
        await fs.unlink(oldImagePath).catch(err => console.error('Error deleting old image:', err));
      }

      updateData.coverPhoto = {
        fileName: req.file.filename,
        filePath: `/uploads/movies/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }

    const movie = await movieService.updateMovie(movieId, updateData);

    // Update related stats if necessary
    const updatePromises = [];
    if (updateData.production?.budget?.amount) {
      updatePromises.push(movie.updateBoxOfficeStats());
    }
    if (updateData.awards) {
      updatePromises.push(movie.updateAwardStats());
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    return ApiResponse.success(res, {
      message: 'Movie updated successfully',
      data: movie
    });
  });

  deleteMovie = catchAsync(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.movieId);
    
    if (movie.coverPhoto?.filePath) {
      const imagePath = path.join('public', movie.coverPhoto.filePath);
      await fs.unlink(imagePath).catch(err => console.error('Error deleting image:', err));
    }

    await movieService.deleteMovie(req.params.movieId);
    return ApiResponse.success(res, {
      message: 'Movie deleted successfully'
    });
  });

  getMovieById = catchAsync(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.movieId);

    // Increment view count and update popularity
    await movie.incrementViewCount();

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

  updateMovieStats = catchAsync(async (req, res) => {
    const { movieId } = req.params;
    const movie = await movieService.getMovieById(movieId);

    await Promise.all([
      movie.updateBoxOfficeStats(),
      movie.updateAwardStats()
    ]);

    return ApiResponse.success(res, {
      message: 'Movie stats updated successfully',
      data: movie
    });
  });
}

module.exports = new MovieController();