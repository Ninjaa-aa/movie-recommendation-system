const Review = require('../../../models/review.model');
const ApiError = require('../../../utils/ApiError');

class ReviewService {
  async createReview(userId, movieId, content) {
    const existingReview = await Review.findOne({ 
      userId, 
      movieId,
      isDeleted: { $ne: true }
    });
    
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this movie');
    }

    return Review.create({
      userId,
      movieId,
      content,
      status: 'pending',  // Set initial status
      isHighlighted: false,
      likes: 0
    });
  }

  async reportReview(reviewId, userId, reason, description = '') {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if user has already reported this review
    const existingReport = review.reports.find(
      report => report.userId.toString() === userId.toString()
    );
    
    if (existingReport) {
      throw new ApiError(400, 'You have already reported this review');
    }

    review.reports.push({
      userId,
      reason,
      description
    });

    return review.save();
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
    try {
      const skip = (page - 1) * limit;
      const query = { movieId };
      
      if (highlighted === true) {
        query.isHighlighted = true;
      }

      const reviews = await Review.find(query)
        .populate({
          path: 'userId',
          select: 'username profilePicture'
        })
        .populate({
          path: 'movieId',
          select: 'title posterPath'
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(); // Convert to plain JavaScript objects

      const total = await Review.countDocuments(query);

      // Transform the results to include formatted dates and additional fields
      const formattedReviews = reviews.map(review => ({
        ...review,
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
        updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
        user: review.userId ? {
          id: review.userId._id,
          username: review.userId.username,
          profilePicture: review.userId.profilePicture
        } : null,
        movie: review.movieId ? {
          id: review.movieId._id,
          title: review.movieId.title,
          posterPath: review.movieId.posterPath
        } : null
      }));

      return {
        results: formattedReviews,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in getMovieReviews:', error);
      throw error;
    }
  }

  async getHighlightedReviews(page, limit) {
    try {
      const skip = (page - 1) * limit;
      
      const reviews = await Review.find({ isHighlighted: true })
        .populate({
          path: 'userId',
          select: 'username profilePicture'
        })
        .populate({
          path: 'movieId',
          select: 'title posterPath'
        })
        .skip(skip)
        .limit(limit)
        .sort({ likes: -1, createdAt: -1 })
        .lean();

      const total = await Review.countDocuments({ isHighlighted: true });

      // Transform the results to include formatted dates and additional fields
      const formattedReviews = reviews.map(review => ({
        ...review,
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
        updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
        user: review.userId ? {
          id: review.userId._id,
          username: review.userId.username,
          profilePicture: review.userId.profilePicture
        } : null,
        movie: review.movieId ? {
          id: review.movieId._id,
          title: review.movieId.title,
          posterPath: review.movieId.posterPath
        } : null
      }));

      return {
        results: formattedReviews,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in getHighlightedReviews:', error);
      throw error;
    }
  }

  // Add a method to highlight/unhighlight a review
  async toggleHighlight(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    review.isHighlighted = !review.isHighlighted;
    return review.save();
  }
}

module.exports = new ReviewService();