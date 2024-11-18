const Rating = require('../models/rating.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');
const recommendationService = require('./recommendation.service');

class RatingService {
  async createRating(userId, movieId, rating) {
    try {
      const existingRating = await Rating.findOne({ userId, movieId });
      if (existingRating) {
        throw new ApiError(400, 'You have already rated this movie');
      }

      const newRating = await Rating.create({
        userId,
        movieId,
        rating
      });

      // Update movie average rating
      await this.updateMovieAverageRating(movieId);

      // Update trending score for rating action
      await recommendationService.updateTrendingScore(movieId, 'rating');

      return newRating;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error creating rating');
    }
  }

  async updateRating(userId, movieId, rating) {
    try {
      const existingRating = await Rating.findOne({ userId, movieId });
      if (!existingRating) {
        throw new ApiError(404, 'Rating not found');
      }

      existingRating.rating = rating;
      existingRating.updatedAt = Date.now();
      await existingRating.save();

      // Update movie average rating
      await this.updateMovieAverageRating(movieId);

      // Update trending score for rating update
      await recommendationService.updateTrendingScore(movieId, 'rating');

      return existingRating;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating rating');
    }
  }

  async getMovieRatings(movieId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [ratings, total] = await Promise.all([
        Rating.find({ movieId })
          .populate('userId', 'username')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Rating.countDocuments({ movieId })
      ]);

      return {
        results: ratings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching movie ratings');
    }
  }

  async updateMovieAverageRating(movieId) {
    try {
      const ratings = await Rating.find({ movieId });
      const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

      await Movie.findByIdAndUpdate(movieId, { 
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length 
      });
    } catch (error) {
      throw new ApiError(500, 'Error updating movie average rating');
    }
  }

  async getUserRating(userId, movieId) {
    try {
      const rating = await Rating.findOne({ userId, movieId });
      return rating;
    } catch (error) {
      throw new ApiError(500, 'Error fetching user rating');
    }
  }
}

module.exports = new RatingService();