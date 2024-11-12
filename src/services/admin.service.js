// src/api/v1/admin/admin.service.js
const Review = require('../models/review.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const Statistics = require('../models/statistics.model')
const User = require('../models/user.model')
class AdminService {
  async getMovieModeration() {
    try {
      const pendingReviews = await Review.find({
        $or: [
          { status: 'pending' },
          { status: { $exists: false } }  // Include reviews without status
        ],
        isDeleted: { $ne: true }  // Exclude soft deleted reviews
      })
        .populate('userId', 'username email profilePicture')
        .populate('movieId', 'title releaseDate posterPath')
        .sort({ createdAt: -1 });

      const reportedReviews = await Review.find({
        'reports.0': { $exists: true },  // Has at least one report
        status: { $nin: ['rejected', 'removed'] },  // Not already rejected or removed
        isDeleted: { $ne: true }
      })
        .populate('userId', 'username email profilePicture')
        .populate('movieId', 'title releaseDate posterPath')
        .sort({ createdAt: -1 });

      return {
        pendingReviews,
        reportedReviews,
        stats: {
          pendingCount: pendingReviews.length,
          reportedCount: reportedReviews.length
        }
      };
    } catch (error) {
      logger.error('Error in getMovieModeration:', error);
      throw new ApiError(500, 'Error fetching moderation data');
    }
  }

  async moderateReview(reviewId, action, reason) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    switch (action) {
      case 'approve':
        review.status = 'approved';
        break;
      case 'reject':
        review.status = 'rejected';
        review.rejectionReason = reason;
        break;
      case 'remove':
        review.status = 'removed';
        review.removalReason = reason;
        break;
      default:
        throw new ApiError(400, 'Invalid moderation action');
    }

    await review.save();
    return review;
  }

  async getSiteStatistics(timeframe = '7d') {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      const [
        movieStats,
        userStats,
        genreStats,
        actorStats,
        engagementStats
      ] = await Promise.all([
        this.getMovieStatistics(dateFilter),
        this.getUserStatistics(dateFilter),
        this.getGenreStatistics(dateFilter),
        this.getActorStatistics(dateFilter),
        this.getEngagementStatistics(dateFilter)
      ]);

      return {
        movies: movieStats,
        users: userStats,
        genres: genreStats,
        actors: actorStats,
        engagement: engagementStats
      };
    } catch (error) {
      logger.error('Error in getSiteStatistics:', error);
      throw new ApiError(500, 'Error fetching site statistics');
    }
  }

  // Helper methods
  getDateFilter(timeframe) {
    const now = new Date();
    const filters = {
      '24h': new Date(now - 24 * 60 * 60 * 1000),
      '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now - 30 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };
    return { $gte: filters[timeframe] || filters['7d'] };
  }

  async getMovieStatistics(dateFilter) {
    try {
      // Use Movie model for recent movies since Statistics might be empty initially
      const recentlyAdded = await Movie.find({
        createdAt: dateFilter
      })
      .sort({ createdAt: -1 })
      .limit(10);

      // Provide default stats if no views are recorded yet
      let mostViewed = [];
      try {
        mostViewed = await Movie.aggregate([
          {
            $match: {
              createdAt: { $exists: true }  // Just ensure the document exists
            }
          },
          {
            $project: {
              title: 1,
              releaseDate: 1,
              posterPath: 1,
              totalViews: { $literal: 0 }  // Default views to 0
            }
          },
          { $limit: 10 }
        ]);

        // Try to get actual view statistics if they exist
        const viewStats = await Statistics.aggregate([
          {
            $match: {
              type: 'movie_view',
              timestamp: dateFilter
            }
          },
          {
            $group: {
              _id: '$entityId',
              totalViews: { $sum: '$count' }
            }
          },
          { $sort: { totalViews: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'movies',
              localField: '_id',
              foreignField: '_id',
              as: 'movie'
            }
          },
          { $unwind: '$movie' }
        ]);

        if (viewStats.length > 0) {
          mostViewed = viewStats;
        }
      } catch (error) {
        logger.error('Error fetching movie view statistics:', error);
        // Continue with default mostViewed array
      }

      return {
        mostViewed,
        recentlyAdded,
        totalMovies: await Movie.countDocuments(),
        newMoviesCount: await Movie.countDocuments({ createdAt: dateFilter })
      };
    } catch (error) {
      logger.error('Error in getMovieStatistics:', error);
      throw new ApiError(500, 'Error fetching movie statistics');
    }
  }

  async getUserStatistics(dateFilter) {
    try {
      const newUsers = await User.countDocuments({
        createdAt: dateFilter
      });

      // Default active users if no engagement data exists
      let activeUsers = [];
      try {
        const engagementStats = await Statistics.aggregate([
          {
            $match: {
              type: 'user_engagement',
              timestamp: dateFilter
            }
          },
          {
            $group: {
              _id: '$entityId',
              activityCount: { $sum: 1 }
            }
          },
          { $sort: { activityCount: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' }
        ]);

        if (engagementStats.length > 0) {
          activeUsers = engagementStats;
        }
      } catch (error) {
        logger.error('Error fetching user engagement statistics:', error);
        // Continue with empty activeUsers array
      }

      return {
        newUsers,
        activeUsers,
        totalUsers: await User.countDocuments(),
        verifiedUsers: await User.countDocuments({ isVerified: true })
      };
    } catch (error) {
      logger.error('Error in getUserStatistics:', error);
      throw new ApiError(500, 'Error fetching user statistics');
    }
  }


  async getGenreStatistics(dateFilter) {
    return await Statistics.aggregate([
      { $match: { 
        type: 'genre_view',
        timestamp: dateFilter
      }},
      { $group: {
        _id: '$entityId',
        views: { $sum: '$count' }
      }},
      { $sort: { views: -1 }},
      { $limit: 10 }
    ]);
  }

  async getActorStatistics(dateFilter) {
    const mostSearched = await Statistics.aggregate([
      { $match: { 
        type: 'search',
        entityType: 'Actor',
        timestamp: dateFilter
      }},
      { $group: {
        _id: '$entityId',
        searchCount: { $sum: '$count' }
      }},
      { $sort: { searchCount: -1 }},
      { $limit: 10 },
      { $lookup: {
        from: 'actors',
        localField: '_id',
        foreignField: '_id',
        as: 'actor'
      }},
      { $unwind: '$actor' }
    ]);

    return mostSearched;
  }

  async getEngagementStatistics(dateFilter) {
    const reviewStats = await Review.aggregate([
      { $match: { createdAt: dateFilter }},
      { $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }}
    ]);

    const userEngagement = await Statistics.aggregate([
      { $match: { 
        type: 'user_engagement',
        timestamp: dateFilter
      }},
      { $group: {
        _id: '$metadata.actionType',
        count: { $sum: 1 }
      }}
    ]);

    return {
      reviews: reviewStats[0] || { totalReviews: 0, avgRating: 0 },
      engagement: userEngagement
    };
  }
}

module.exports = new AdminService();