// src/api/v1/movies/movies.service.js
const Movie = require('../../../models/movie.model');
const { ApiError } = require('../../../utils/apiResponse');
const { getPagination } = require('../../../utils/pagination');

class MovieService {
  async createMovie(movieData) {
    const movie = new Movie(movieData);
    await movie.save();
    return movie;
  }

  async updateMovie(movieId, updateData) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }

    Object.assign(movie, updateData);
    await movie.save();
    return movie;
  }

  async deleteMovie(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }

    movie.isActive = false;
    await movie.save();
    return { message: 'Movie deleted successfully' };
  }

  async getMovieById(movieId) {
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }
    return movie;
  }

  async getMovies(filters) {
    const { 
      page = 1, 
      limit = 10, 
      genre, 
      language,
      status,
      search, 
      sortBy = 'releaseDate', 
      sortOrder = 'desc' 
    } = filters;

    const { skip, take } = getPagination(page, limit);

    // Build query
    const query = { isActive: true };
    
    if (genre) query.genre = genre;
    if (language) query.language = language;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [movies, total] = await Promise.all([
      Movie.find(query)
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
  }
}

module.exports = new MovieService();