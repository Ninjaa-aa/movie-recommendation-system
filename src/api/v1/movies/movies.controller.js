// src/api/v1/movies/movies.controller.js
const movieService = require('./movies.sevices');
const { ApiResponse } = require('../../../utils/apiResponse');
const { catchAsync } = require('../../../utils/catchAsync');
const fs = require('fs').promises;
const path = require('path');

class MovieController {
  createMovie = catchAsync(async (req, res) => {
    // Handle file upload
    if (!req.file) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'Cover photo is required'
      });
    }

    // Add file information to request body
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
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Movie created successfully',
      data: movie
    });
  });

  updateMovie = catchAsync(async (req, res) => {
    const updateData = { ...req.body };

    // Handle file upload if new image is provided
    if (req.file) {
      // Get old movie data to delete previous image
      const oldMovie = await movieService.getMovieById(req.params.movieId);
      
      if (oldMovie.coverPhoto?.filePath) {
        // Delete old image
        const oldImagePath = path.join('public', oldMovie.coverPhoto.filePath);
        await fs.unlink(oldImagePath).catch(err => console.error('Error deleting old image:', err));
      }

      // Add new file information
      updateData.coverPhoto = {
        fileName: req.file.filename,
        filePath: `/uploads/movies/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }

    const movie = await movieService.updateMovie(req.params.movieId, updateData);
    return ApiResponse.success(res, {
      message: 'Movie updated successfully',
      data: movie
    });
  });

  deleteMovie = catchAsync(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.movieId);
    
    // Delete image file if exists
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