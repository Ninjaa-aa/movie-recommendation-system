const mongoose = require('mongoose');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError'); // Fixed import
const { getPagination } = require('../utils/pagination');

class MovieService {
  /**
   * Create a new movie
   * @param {Object} movieData
   * @returns {Promise<Object>} Created movie
   */
  async createMovie(movieData) {
    try {
      const movie = new Movie(movieData);
      await movie.save();
      return movie;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, 'Movie already exists');
      }
      throw new ApiError(500, 'Error creating movie');
    }
  }

  /**
   * Update an existing movie
   * @param {string} movieId
   * @param {Object} updateData
   * @returns {Promise<Object>} Updated movie
   */
  async updateMovie(movieId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID');
      }

      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      Object.assign(movie, updateData);
      await movie.save();
      return movie;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.code === 11000) {
        throw new ApiError(409, 'Movie with updated details already exists');
      }
      throw new ApiError(500, 'Error updating movie');
    }
  }

  /**
   * Soft delete a movie
   * @param {string} movieId
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteMovie(movieId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID');
      }

      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      movie.isActive = false;
      await movie.save();
      return { message: 'Movie deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting movie');
    }
  }

  /**
   * Get movie by ID
   * @param {string} movieId
   * @returns {Promise<Object>} Movie details
   */
  async getMovieById(movieId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, 'Invalid movie ID');
      }

      const movie = await Movie.findOne({ 
        _id: movieId, 
        isActive: true 
      }).populate('genre');

      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      return movie;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error retrieving movie');
    }
  }

  /**
   * Get movies with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Movies and pagination info
   */
  async getMovies(filters) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        genre, 
        language, 
        status, 
        search, 
        sortBy = 'releaseDate', 
        sortOrder = 'desc',
        year,
        rating
      } = filters;

      const { skip, take } = getPagination(page, limit);

      // Build query
      const query = { isActive: true };

      if (genre) query.genre = genre;
      if (language) query.language = language;
      if (status) query.status = status;
      if (year) query.year = year;
      if (rating) query.rating = { $gte: parseFloat(rating) };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { director: { $regex: search, $options: 'i' } },
          { cast: { $regex: search, $options: 'i' } }
        ];
      }

      // Validate and build sort
      const allowedSortFields = ['releaseDate', 'title', 'rating', 'year'];
      const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'releaseDate';
      const sort = {
        [actualSortBy]: sortOrder === 'desc' ? -1 : 1
      };

      // Execute query with pagination
      const [movies, total] = await Promise.all([
        Movie.find(query)
          .populate('genre')
          .sort(sort)
          .skip(skip)
          .limit(take),
        Movie.countDocuments(query)
      ]);

      return {
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ApiError(500, 'Error retrieving movies');
    }
  }

  /**
   * Search movies by title, director, or cast
   * @param {string} searchTerm
   * @returns {Promise<Array>} Matching movies
   */
  async searchMovies(searchTerm) {
    try {
      if (!searchTerm) {
        throw new ApiError(400, 'Search term is required');
      }

      const movies = await Movie.find({
        isActive: true,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { director: { $regex: searchTerm, $options: 'i' } },
          { cast: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .populate('genre')
      .limit(10);

      return movies;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error searching movies');
    }
  }
}

module.exports = new MovieService();