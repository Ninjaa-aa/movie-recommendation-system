// src/api/v1/reviews/review.service.js
const Review = require('../../../models/review.model');
const ApiError = require('../../../utils/ApiError');

class ReviewService {
  async createReview(userId, movieId, content) {
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this movie');
    }

    return Review.create({
      userId,
      movieId,
      content
    });
  }

  async updateReview(userId, movieId, content) {
    const existingReview = await Review.findOne({ userId, movieId });
    if (!existingReview) {
      throw new ApiError(404, 'Review not found');
    }

    existingReview.content = content;
    existingReview.updatedAt = Date.now();
    return existingReview.save();
  }

  async getMovieReviews(movieId, highlighted, page, limit) {
    const skip = (page - 1) * limit;
    const query = { movieId };
    if (highlighted) {
      query.isHighlighted = true;
    }

    const reviews = await Review.find(query)
      .populate('userId', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ likes: -1, createdAt: -1 });

    const total = await Review.countDocuments(query);

    return {
      results: reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getHighlightedReviews(page, limit) {
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ isHighlighted: true })
      .populate('userId', 'username')
      .populate('movieId', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ likes: -1, createdAt: -1 });

    const total = await Review.countDocuments({ isHighlighted: true });

    return {
      results: reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = new ReviewService();