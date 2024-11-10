// src/api/v1/wishlist/wishlist.service.js
const mongoose = require('mongoose');
const Wishlist = require('../../../models/wishlist.model');
const Movie = require('../../../models/movie.model');
const { ApiError } = require('../../../utils/apiResponse');

class WishlistService {
  async getWishlist(userId) {
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('movies.movie', 'title genre releaseDate coverPhoto');
    
    if (!wishlist) {
      return await Wishlist.create({ user: userId, movies: [] });
    }
    return wishlist;
  }

  async getAvailableMovies(userId) {
    // Get user's existing wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    const existingMovieIds = wishlist ? wishlist.movies.map(m => m.movie.toString()) : [];

    // Get all active movies that are not in the wishlist
    const availableMovies = await Movie.find({
      _id: { $nin: existingMovieIds },
      isActive: true
    }).select('_id title genre releaseDate');

    return availableMovies;
  }

  async addToWishlist(userId, { movieId, notes, priority }) {
    try {
      // Validate movieId format
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID format');
      }

      // Verify movie exists
      const movie = await Movie.findOne({ 
        _id: movieId, 
        isActive: true 
      });

      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      let wishlist = await Wishlist.findOne({ user: userId });
      
      if (!wishlist) {
        wishlist = await Wishlist.create({ 
          user: userId,
          movies: [{ movie: movieId, notes, priority }]
        });
      } else {
        // Check if movie already exists
        const movieExists = wishlist.movies.some(m => m.movie.toString() === movieId);
        if (movieExists) {
          throw new ApiError(400, 'Movie already in wishlist');
        }

        wishlist.movies.push({ movie: movieId, notes, priority });
        await wishlist.save();
      }

      return await wishlist.populate('movies.movie', 'title genre releaseDate coverPhoto');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid movie ID format');
      }
      throw error;
    }
  }

  async removeFromWishlist(userId, movieId) {
    try {
      // Validate movieId format
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID format');
      }

      const wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        throw new ApiError(404, 'Wishlist not found');
      }

      const movieIndex = wishlist.movies.findIndex(m => m.movie.toString() === movieId);
      if (movieIndex === -1) {
        throw new ApiError(404, 'Movie not found in wishlist');
      }

      wishlist.movies.splice(movieIndex, 1);
      await wishlist.save();
      return await wishlist.populate('movies.movie', 'title genre releaseDate coverPhoto');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid movie ID format');
      }
      throw error;
    }
  }

  async updateMovieNotes(userId, movieId, { notes, priority }) {
    try {
      // Validate movieId format
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID format');
      }

      const wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        throw new ApiError(404, 'Wishlist not found');
      }

      const movie = wishlist.movies.find(m => m.movie.toString() === movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found in wishlist');
      }

      if (notes !== undefined) movie.notes = notes;
      if (priority !== undefined) movie.priority = priority;

      await wishlist.save();
      return await wishlist.populate('movies.movie', 'title genre releaseDate coverPhoto');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid movie ID format');
      }
      throw error;
    }
  }
}

module.exports = WishlistService;