const mongoose = require('mongoose');
const Wishlist = require('../models/wishlist.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError'); // Fixed import

class WishlistService {
  /**
   * Get user's wishlist
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Wishlist with populated movie data
   */
  async getWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId })
        .populate('movies.movie', 'title genre releaseDate coverPhoto');
      
      if (!wishlist) {
        return await Wishlist.create({ user: userId, movies: [] });
      }
      return wishlist;
    } catch (error) {
      throw new ApiError(500, 'Error retrieving wishlist');
    }
  }

  /**
   * Get movies available to add to wishlist
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of available movies
   */
  async getAvailableMovies(userId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId });
      const existingMovieIds = wishlist ? wishlist.movies.map(m => m.movie.toString()) : [];

      const availableMovies = await Movie.find({
        _id: { $nin: existingMovieIds },
        isActive: true
      }).select('_id title genre releaseDate');

      return availableMovies;
    } catch (error) {
      throw new ApiError(500, 'Error retrieving available movies');
    }
  }

  /**
   * Add movie to wishlist
   * @param {string} userId - User ID
   * @param {Object} params - Movie parameters
   * @param {string} params.movieId - Movie ID to add
   * @param {string} params.notes - Optional notes
   * @param {string} params.priority - Optional priority level
   * @returns {Promise<Object>} Updated wishlist
   */
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
        throw new ApiError(404, 'Movie not found or inactive');
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
      console.error('Add to wishlist error:', error);
      throw new ApiError(500, 'Error adding movie to wishlist');
    }
  }

  /**
   * Remove movie from wishlist
   * @param {string} userId - User ID
   * @param {string} movieId - Movie ID to remove
   * @returns {Promise<Object>} Updated wishlist
   */
  async removeFromWishlist(userId, movieId) {
    try {
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
      console.error('Remove from wishlist error:', error);
      throw new ApiError(500, 'Error removing movie from wishlist');
    }
  }

  /**
   * Update movie notes in wishlist
   * @param {string} userId - User ID
   * @param {string} movieId - Movie ID to update
   * @param {Object} updates - Update parameters
   * @param {string} updates.notes - New notes
   * @param {string} updates.priority - New priority
   * @returns {Promise<Object>} Updated wishlist
   */
  async updateMovieNotes(userId, movieId, { notes, priority }) {
    try {
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
      console.error('Update movie notes error:', error);
      throw new ApiError(500, 'Error updating movie notes');
    }
  }
}

module.exports = WishlistService;