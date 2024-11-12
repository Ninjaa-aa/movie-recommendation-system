const mongoose = require('mongoose');
const Activity = require('../../../models/activity.model');
const Movie = require('../../../models/movie.model');
const User = require('../../../models/user.model');
const Review = require('../../../models/review.model');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../utils/logger');

class AnalyticsService {
  async getOverallStats(period = '30d') {
    try {
      logger.debug('Getting overall stats for period:', period);
      const dateFilter = this.getDateFilter(period);
      
      const [userStats, movieStats, engagementStats, genreStats, actorStats] = await Promise.all([
        this.getUserStats(dateFilter),
        this.getMovieStats(dateFilter),
        this.getEngagementStats(dateFilter),
        this.getGenreStats(dateFilter),
        this.getActorStats(dateFilter)
      ]);

      logger.debug('Overall stats retrieved successfully');

      return {
        userStats,
        movieStats,
        engagementStats,
        genreStats,
        actorStats
      };
    } catch (error) {
      logger.error('Error in getOverallStats:', error);
      throw new ApiError(500, 'Error fetching analytics: ' + error.message);
    }
  }

  async getUserStats(dateFilter) {
    try {
      const [totalUsers, newUsers, activeUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: dateFilter }),
        Activity.distinct('user', { createdAt: dateFilter }).then(users => users.length)
      ]);

      return {
        totalUsers,
        newUsers,
        activeUsers,
        userGrowth: totalUsers > 0 ? (newUsers / totalUsers * 100).toFixed(2) : 0,
        activeUserRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Error in getUserStats:', error);
      throw new ApiError(500, 'Error fetching user statistics');
    }
  }

  async getMovieStats(dateFilter) {
    try {
      const pipeline = [
        { $match: { createdAt: dateFilter } },
        {
          $facet: {
            views: [
              { $match: { type: 'MOVIE_VIEW' } },
              { $group: { _id: '$movie', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
              {
                $lookup: {
                  from: 'movies',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'movie'
                }
              },
              { $unwind: '$movie' },
              {
                $project: {
                  _id: 0,
                  movieId: '$movie._id',
                  title: '$movie.title',
                  views: '$count'
                }
              }
            ],
            ratings: [
              { $match: { type: 'RATING_ADD' } },
              { $group: { _id: '$movie', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
              {
                $lookup: {
                  from: 'movies',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'movie'
                }
              },
              { $unwind: '$movie' },
              {
                $project: {
                  _id: 0,
                  movieId: '$movie._id',
                  title: '$movie.title',
                  ratings: '$count'
                }
              }
            ]
          }
        }
      ];

      const results = await Activity.aggregate(pipeline);
      return results[0];
    } catch (error) {
      logger.error('Error in getMovieStats:', error);
      throw new ApiError(500, 'Error fetching movie statistics');
    }
  }

  async getEngagementStats(dateFilter) {
    try {
      const pipeline = [
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            count: 1
          }
        }
      ];

      const results = await Activity.aggregate(pipeline);
      
      // Transform array to object for easier consumption
      return results.reduce((acc, { type, count }) => {
        acc[type.toLowerCase()] = count;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error in getEngagementStats:', error);
      throw new ApiError(500, 'Error fetching engagement statistics');
    }
  }

  getDateFilter(period) {
    const date = new Date();
    switch (period) {
      case '24h':
        date.setHours(date.getHours() - 24);
        break;
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return { $gte: date };
  }
}

module.exports = AnalyticsService;