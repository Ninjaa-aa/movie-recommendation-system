// src/api/v1/wishlist/wishlist.service.js
const Wishlist = require('../../../models/wishlist.model');
const { ApiError } = require('../../../utils/apiResponse');

class WishlistService {
  async getWishlist(userId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      // Create new wishlist if it doesn't exist
      return await Wishlist.create({ user: userId, movies: [] });
    }
    return wishlist;
  }

  async addToWishlist(userId, { movieId, title, notes, priority }) {
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        user: userId,
        movies: [{ movieId, title, notes, priority }]
      });
    } else {
      // Check if movie already exists
      const movieExists = wishlist.movies.some(movie => movie.movieId === movieId);
      if (movieExists) {
        throw new ApiError(400, 'Movie already in wishlist');
      }

      wishlist.movies.push({ movieId, title, notes, priority });
      await wishlist.save();
    }

    return wishlist;
  }

  async removeFromWishlist(userId, movieId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    const movieIndex = wishlist.movies.findIndex(movie => movie.movieId === movieId);
    if (movieIndex === -1) {
      throw new ApiError(404, 'Movie not found in wishlist');
    }

    wishlist.movies.splice(movieIndex, 1);
    await wishlist.save();
    return wishlist;
  }

  async updateMovieNotes(userId, movieId, { notes, priority }) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    const movie = wishlist.movies.find(movie => movie.movieId === movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found in wishlist');
    }

    if (notes) movie.notes = notes;
    if (priority) movie.priority = priority;

    await wishlist.save();
    return wishlist;
  }
}

module.exports = WishlistService;