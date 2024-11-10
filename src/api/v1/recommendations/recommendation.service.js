// src/api/v1/recommendations/recommendation.service.js
const Recommendation = require('../../../models/recommendation.model');
const Trending = require('../../../models/trending.model');
const Movie = require('../../../models/movie.model');
const Rating = require('../../../models/rating.model');
const User = require('../../../models/user.model');
const ApiError = require('../../../utils/ApiError');

class RecommendationService {
  async getSimilarMovies(movieId, limit = 10) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }

    // Find movies with similar genres
    const similarMovies = await Movie.find({
      _id: { $ne: movieId },
      genre: { $in: movie.genre },
      isActive: true // Only active movies
    })
    .sort({ avgRating: -1 }) // Changed from averageRating to avgRating
    .limit(limit)
    .select('-__v');

    return similarMovies;
  }

  async getPersonalizedRecommendations(userId, page = 1, limit = 10) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // First try to get user's ratings
    const userRatings = await Rating.find({ userId });
    
    // If user has no ratings, return top rated or newest movies
    if (!userRatings || userRatings.length === 0) {
      console.log('No ratings found for user, returning top rated movies');
      return this.getTopRatedMovies(page, limit);
    }

    // Get all active movies
    const allMovies = await Movie.find({ isActive: true });
    if (!allMovies || allMovies.length === 0) {
      return {
        results: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0
      };
    }

    // Get rated movie IDs
    const ratedMovieIds = new Set(userRatings.map(r => r.movieId.toString()));

    // Get user's favorite genres
    const genreScores = {};
    const ratedMovies = await Movie.find({ 
      _id: { $in: Array.from(ratedMovieIds) }
    });

    ratedMovies.forEach(movie => {
      if (movie.genre) {
        movie.genre.forEach(genre => {
          genreScores[genre] = (genreScores[genre] || 0) + 1;
        });
      }
    });

    // Get recommended movies
    const recommendedMovies = allMovies
      .filter(movie => !ratedMovieIds.has(movie._id.toString())) // Remove rated movies
      .map(movie => {
        // Calculate score based on genre matches
        let score = 0;
        movie.genre.forEach(genre => {
          if (genreScores[genre]) {
            score += genreScores[genre];
          }
        });
        return { movie, score };
      })
      .sort((a, b) => {
        // Sort by score and then by rating
        if (b.score !== a.score) return b.score - a.score;
        return (b.movie.avgRating || 0) - (a.movie.avgRating || 0);
      })
      .map(item => item.movie);

    // Handle pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = recommendedMovies.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      total: recommendedMovies.length,
      page: parseInt(page),
      totalPages: Math.ceil(recommendedMovies.length / limit)
    };

  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    throw error;
  }
}

  async getTrendingMovies(period = 'weekly', page = 1, limit = 10) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    switch(period) {
      case 'daily':
        // Use today's date
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      default:
        throw new ApiError(400, 'Invalid period specified');
    }

    // First, get active movies
    const activeMovies = await Movie.find({ isActive: true }).select('_id');
    const activeMovieIds = activeMovies.map(m => m._id);

    const trending = await Trending.find({
      period,
      date: { $gte: date },
      movieId: { $in: activeMovieIds }
    })
    .sort({ score: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: 'movieId',
      select: '-__v'
    });

    const total = await Trending.countDocuments({
      period,
      date: { $gte: date },
      movieId: { $in: activeMovieIds }
    });

    // If no trending movies found, return top rated movies
    if (!trending.length) {
      return this.getTopRatedMovies(page, limit);
    }

    return {
      results: trending.map(t => t.movieId).filter(Boolean),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTopRatedMovies(page = 1, limit = 10) {
    const movies = await Movie.find({
      avgRating: { $exists: true, $ne: null }, // Changed from averageRating to avgRating
      isActive: true
    })
    .sort({ avgRating: -1 }) // Changed from averageRating to avgRating
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-__v');

    // If no rated movies found, return newest movies
    if (!movies.length) {
      const newestMovies = await Movie.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v');

      const total = await Movie.countDocuments({ isActive: true });

      return {
        results: newestMovies,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    }

    const total = await Movie.countDocuments({
      avgRating: { $exists: true, $ne: null },
      isActive: true
    });

    return {
      results: movies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateTrendingScore(movieId, action) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }

    const periods = ['daily', 'weekly', 'monthly'];
    const actionScores = {
      view: 1,
      rating: 5,
      review: 10
    };

    const score = actionScores[action] || 1;
    const updatePromises = periods.map(period => 
      Trending.findOneAndUpdate(
        {
          movieId,
          period,
          date
        },
        {
          $inc: {
            score,
            [`${action}Count`]: 1
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
    );

    await Promise.all(updatePromises);
  }
}

module.exports = new RecommendationService();