// src/api/v1/ratings/rating.service.js
const Rating = require('../models/rating.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');

class RatingService {
  async createRating(userId, movieId, rating) {
    const existingRating = await Rating.findOne({ userId, movieId });
    if (existingRating) {
      throw new ApiError(400, 'You have already rated this movie');
    }

    const newRating = await Rating.create({
      userId,
      movieId,
      rating
    });

    await this.updateMovieAverageRating(movieId);
    return newRating;
  }

  async updateRating(userId, movieId, rating) {
    const existingRating = await Rating.findOne({ userId, movieId });
    if (!existingRating) {
      throw new ApiError(404, 'Rating not found');
    }

    existingRating.rating = rating;
    existingRating.updatedAt = Date.now();
    await existingRating.save();

    await this.updateMovieAverageRating(movieId);
    return existingRating;
  }

  async getMovieRatings(movieId, page, limit) {
    const skip = (page - 1) * limit;
    const ratings = await Rating.find({ movieId })
      .populate('userId', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Rating.countDocuments({ movieId });

    return {
      results: ratings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateMovieAverageRating(movieId) {
    const ratings = await Rating.find({ movieId });
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    await Movie.findByIdAndUpdate(movieId, { 
      averageRating: Math.round(averageRating * 10) / 10 
    });
  }
}

module.exports = new RatingService();