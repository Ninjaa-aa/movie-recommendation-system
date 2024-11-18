const Recommendation = require('../models/recommendation.model');
const Trending = require('../models/trending.model');
const Movie = require('../models/movie.model');
const Rating = require('../models/rating.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

class RecommendationService {
  async getSimilarMovies(movieId, limit = 10) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found');
    }

    // Calculate content-based similarity using genres and other features
    const similarityScore = (compareMovie) => {
      let score = 0;
      
      // Genre similarity (weighted at 40%)
      const genreOverlap = movie.genre.filter(g => compareMovie.genre.includes(g)).length;
      score += (genreOverlap / Math.max(movie.genre.length, compareMovie.genre.length)) * 0.4;
      
      // Rating similarity (weighted at 30%)
      const ratingDiff = Math.abs((movie.avgRating || 0) - (compareMovie.avgRating || 0)) / 5;
      score += (1 - ratingDiff) * 0.3;
      
      // Release year similarity (weighted at 30%)
      const yearDiff = Math.abs(movie.releaseYear - compareMovie.releaseYear) / 100;
      score += (1 - Math.min(yearDiff, 1)) * 0.3;
      
      return score;
    };

    const similarMovies = await Movie.find({
      _id: { $ne: movieId },
      isActive: true
    }).select('-__v');

    return similarMovies
      .map(m => ({ movie: m, score: similarityScore(m) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.movie);
  }

  async getPersonalizedRecommendations(userId, page = 1, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Get user's ratings and viewing history
      const userRatings = await Rating.find({ userId }).populate('movieId');
      const userHistory = await this.getUserViewingHistory(userId);

      // If no data available, return collaborative recommendations
      if (!userRatings.length && !userHistory.length) {
        return this.getCollaborativeRecommendations(userId, page, limit);
      }

      // Calculate user preference profile
      const preferences = this.calculateUserPreferences(userRatings, userHistory);
      
      // Get candidate movies (not rated or viewed)
      const ratedMovieIds = new Set(userRatings.map(r => r.movieId._id.toString()));
      const viewedMovieIds = new Set(userHistory.map(h => h.movieId.toString()));
      const excludeIds = new Set([...ratedMovieIds, ...viewedMovieIds]);

      const candidateMovies = await Movie.find({
        _id: { $nin: Array.from(excludeIds) },
        isActive: true
      });

      // Score each candidate movie
      const scoredMovies = candidateMovies.map(movie => ({
        movie,
        score: this.calculateMovieScore(movie, preferences)
      }));

      // Sort and paginate results
      const sortedMovies = scoredMovies
        .sort((a, b) => b.score - a.score)
        .slice((page - 1) * limit, page * limit)
        .map(item => ({
          ...item.movie.toObject(),
          matchScore: Math.round(item.score * 100)
        }));

      return {
        results: sortedMovies,
        total: candidateMovies.length,
        page: parseInt(page),
        totalPages: Math.ceil(candidateMovies.length / limit)
      };
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      throw error;
    }
  }

  async getCollaborativeRecommendations(userId, page = 1, limit = 10) {
    // Find similar users based on rating patterns
    const userRatings = await Rating.find({ userId });
    const allUsers = await Rating.distinct('userId');
    
    const similarUsers = await Promise.all(
      allUsers
        .filter(id => id.toString() !== userId.toString())
        .map(async (otherId) => {
          const otherRatings = await Rating.find({ userId: otherId });
          const similarity = this.calculateUserSimilarity(userRatings, otherRatings);
          return { userId: otherId, similarity };
        })
    );

    // Get recommendations from similar users
    const topSimilarUsers = similarUsers
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    const recommendedMovies = await this.getMoviesFromSimilarUsers(
      userId,
      topSimilarUsers.map(u => u.userId)
    );

    return {
      results: recommendedMovies.slice((page - 1) * limit, page * limit),
      total: recommendedMovies.length,
      page: parseInt(page),
      totalPages: Math.ceil(recommendedMovies.length / limit)
    };
  }

  calculateUserPreferences(ratings, history) {
    const preferences = {
      genres: {},
      actors: {},
      directors: {},
      releaseYears: {},
      ratingDistribution: {},
      viewingTimes: {},
      watchDuration: {}
    };

    // Analyze ratings
    ratings.forEach(rating => {
      const movie = rating.movieId;
      const weight = (rating.rating / 5); // Normalize rating to 0-1

      // Genre preferences
      movie.genre.forEach(genre => {
        preferences.genres[genre] = (preferences.genres[genre] || 0) + weight;
      });

      // Actor preferences
      movie.actors?.forEach(actor => {
        preferences.actors[actor] = (preferences.actors[actor] || 0) + weight;
      });

      // Director preferences
      if (movie.director) {
        preferences.directors[movie.director] = 
          (preferences.directors[movie.director] || 0) + weight;
      }

      // Release year preferences
      const decade = Math.floor(movie.releaseYear / 10) * 10;
      preferences.releaseYears[decade] = 
        (preferences.releaseYears[decade] || 0) + weight;

      // Rating distribution
      preferences.ratingDistribution[rating.rating] = 
        (preferences.ratingDistribution[rating.rating] || 0) + 1;
    });

    // Analyze viewing history
    history.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      preferences.viewingTimes[hour] = (preferences.viewingTimes[hour] || 0) + 1;

      if (view.duration) {
        preferences.watchDuration[view.movieId] = view.duration;
      }
    });

    // Normalize preferences
    Object.keys(preferences).forEach(key => {
      if (typeof preferences[key] === 'object') {
        const total = Object.values(preferences[key]).reduce((a, b) => a + b, 0);
        if (total > 0) {
          Object.keys(preferences[key]).forEach(subKey => {
            preferences[key][subKey] /= total;
          });
        }
      }
    });

    return preferences;
  }

  calculateMovieScore(movie, preferences) {
    let score = 0;
    const weights = {
      genre: 0.3,
      actors: 0.2,
      director: 0.15,
      releaseYear: 0.15,
      rating: 0.2
    };

    // Genre match
    const genreScore = movie.genre.reduce((sum, genre) => 
      sum + (preferences.genres[genre] || 0), 0) / movie.genre.length;
    score += genreScore * weights.genre;

    // Actor match
    if (movie.actors?.length) {
      const actorScore = movie.actors.reduce((sum, actor) =>
        sum + (preferences.actors[actor] || 0), 0) / movie.actors.length;
      score += actorScore * weights.actors;
    }

    // Director match
    if (movie.director && preferences.directors[movie.director]) {
      score += preferences.directors[movie.director] * weights.director;
    }

    // Release year match
    const decade = Math.floor(movie.releaseYear / 10) * 10;
    if (preferences.releaseYears[decade]) {
      score += preferences.releaseYears[decade] * weights.releaseYear;
    }

    // Rating influence
    if (movie.avgRating) {
      score += (movie.avgRating / 5) * weights.rating;
    }

    return score;
  }

  calculateUserSimilarity(userRatings1, userRatings2) {
    const ratings1 = new Map(userRatings1.map(r => [r.movieId.toString(), r.rating]));
    const ratings2 = new Map(userRatings2.map(r => [r.movieId.toString(), r.rating]));

    // Find common movies
    const commonMovies = [...ratings1.keys()].filter(movieId => ratings2.has(movieId));

    if (commonMovies.length === 0) return 0;

    // Calculate Pearson correlation
    const n = commonMovies.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    commonMovies.forEach(movieId => {
      const r1 = ratings1.get(movieId);
      const r2 = ratings2.get(movieId);
      sum1 += r1;
      sum2 += r2;
      sum1Sq += r1 ** 2;
      sum2Sq += r2 ** 2;
      pSum += r1 * r2;
    });

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt(
      (sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n)
    );

    return den === 0 ? 0 : num / den;
  }

  async getUserViewingHistory(userId) {
    // Implement based on your viewing history model
    return [];
  }

  async getMoviesFromSimilarUsers(userId, similarUserIds) {
    const userRatedMovies = new Set(
      (await Rating.find({ userId })).map(r => r.movieId.toString())
    );

    const recommendations = await Rating.aggregate([
      {
        $match: {
          userId: { $in: similarUserIds },
          movieId: { $nin: Array.from(userRatedMovies) }
        }
      },
      {
        $group: {
          _id: '$movieId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // Require at least 2 ratings
        }
      },
      {
        $sort: { avgRating: -1 }
      }
    ]);

    const movieIds = recommendations.map(r => r._id);
    return Movie.find({
      _id: { $in: movieIds },
      isActive: true
    }).sort({ avgRating: -1 });
  }

  async getTrendingMovies(period = 'weekly', page = 1, limit = 10) {
    try {
      // Validate period
      const validPeriods = ['daily', 'weekly', 'monthly'];
      if (!validPeriods.includes(period)) {
        throw new Error('Invalid period specified. Must be daily, weekly, or monthly');
      }

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch(period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Get active movies
      const activeMovies = await Movie.find({ 
        isActive: true 
      }).select('_id');
      
      const activeMovieIds = activeMovies.map(m => m._id);

      // Aggregate trending data
      const trending = await Trending.aggregate([
        {
          $match: {
            period: period,
            date: { $gte: startDate, $lte: endDate },
            movieId: { $in: activeMovieIds }
          }
        },
        {
          $group: {
            _id: '$movieId',
            totalScore: { $sum: '$score' },
            viewCount: { $sum: '$viewCount' },
            ratingCount: { $sum: '$ratingCount' }
          }
        },
        {
          $sort: { totalScore: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);

      // Get total count for pagination
      const total = await Trending.aggregate([
        {
          $match: {
            period: period,
            date: { $gte: startDate, $lte: endDate },
            movieId: { $in: activeMovieIds }
          }
        },
        {
          $group: {
            _id: '$movieId'
          }
        },
        {
          $count: 'total'
        }
      ]);

      // Populate movie details
      const movieIds = trending.map(t => t._id);
      const movies = await Movie.find({
        _id: { $in: movieIds }
      }).select('-__v');

      // Combine trending data with movie details
      const results = trending.map(t => {
        const movie = movies.find(m => m._id.equals(t._id));
        return {
          ...movie.toObject(),
          trendingScore: t.totalScore,
          viewCount: t.viewCount,
          ratingCount: t.ratingCount
        };
      });

      return {
        results,
        total: total[0]?.total || 0,
        page: parseInt(page),
        totalPages: Math.ceil((total[0]?.total || 0) / limit)
      };

    } catch (error) {
      console.error('Error in getTrendingMovies:', error);
      throw error;
    }
  }

  async updateTrendingScore(movieId, action) {
    try {
      const validActions = ['view', 'rating', 'share', 'favorite'];
      if (!validActions.includes(action)) {
        throw new Error('Invalid action specified');
      }

      const date = new Date();
      date.setHours(0, 0, 0, 0);

      const actionScores = {
        view: 1,
        rating: 5,
        share: 3,
        favorite: 2
      };

      const score = actionScores[action];
      const updateField = `${action}Count`;

      // Update trending data for all periods
      const periods = ['daily', 'weekly', 'monthly'];
      const updates = periods.map(period => 
        Trending.findOneAndUpdate(
          {
            movieId,
            period,
            date
          },
          {
            $inc: {
              score: score,
              [updateField]: 1
            }
          },
          {
            upsert: true,
            new: true
          }
        )
      );

      await Promise.all(updates);
      return true;

    } catch (error) {
      console.error('Error in updateTrendingScore:', error);
      throw error;
    }
  }

  /**
   * Get top rated movies
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} Paginated top rated movies
   */
  async getTopRatedMovies(page = 1, limit = 10) {
    try {
      // Input validation
      const validatedPage = Math.max(1, parseInt(page));
      const validatedLimit = Math.max(1, Math.min(50, parseInt(limit)));

      // Get active movies with ratings
      const [movies, total] = await Promise.all([
        Movie.find({
          isActive: true,
          avgRating: { $exists: true, $ne: null }
        })
          .sort({ avgRating: -1, createdAt: -1 })
          .skip((validatedPage - 1) * validatedLimit)
          .limit(validatedLimit)
          .select('-__v')
          .lean(),
        Movie.countDocuments({
          isActive: true,
          avgRating: { $exists: true, $ne: null }
        })
      ]);

      // If no rated movies found, get newest movies
      if (!movies.length) {
        return this.getNewestMovies(validatedPage, validatedLimit);
      }

      // Add ranking information
      const results = movies.map((movie, index) => ({
        ...movie,
        rank: (validatedPage - 1) * validatedLimit + index + 1,
        avgRating: Number(movie.avgRating.toFixed(1))
      }));

      return {
        results,
        total,
        page: validatedPage,
        totalPages: Math.ceil(total / validatedLimit),
        limit: validatedLimit
      };
    } catch (error) {
      console.error('Error in getTopRatedMovies:', error);
      throw new ApiError(500, 'Error retrieving top rated movies');
    }
  }

  /**
   * Get newest movies (fallback for when no rated movies are found)
   * @private
   */
  async getNewestMovies(page = 1, limit = 10) {
    try {
      const [movies, total] = await Promise.all([
        Movie.find({ isActive: true })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select('-__v')
          .lean(),
        Movie.countDocuments({ isActive: true })
      ]);

      return {
        results: movies,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error in getNewestMovies:', error);
      throw new ApiError(500, 'Error retrieving newest movies');
    }
  }
}

module.exports = new RecommendationService();