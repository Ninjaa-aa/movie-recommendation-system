// src/api/v1/admin/analytics.service.js
const { Activity } = require('../../../models/activity.model');
const { Movie } = require('../../../models/movie.model');
const { User } = require('../../../models/user.model');
const { Review } = require('../../../models/review.model');
const ApiError = require('../../../utils/ApiError');

class AnalyticsService {
  async getOverallStats(period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const stats = await Promise.all([
        this.getUserStats(dateFilter),
        this.getMovieStats(dateFilter),
        this.getEngagementStats(dateFilter),
        this.getGenreStats(dateFilter),
        this.getActorStats(dateFilter)
      ]);

      return {
        userStats: stats[0],
        movieStats: stats[1],
        engagementStats: stats[2],
        genreStats: stats[3],
        actorStats: stats[4]
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching analytics');
    }
  }

  async getUserStats(dateFilter) {
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: dateFilter }),
      Activity.distinct('user', { createdAt: dateFilter }).count()
    ]);

    return {
      totalUsers,
      newUsers,
      activeUsers
    };
  }

  async getMovieStats(dateFilter) {
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
                movie: { _id: 1, title: 1 },
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
                movie: { _id: 1, title: 1 },
                ratings: '$count'
              }
            }
          ],
          watchlist: [
            { $match: { type: 'WATCHLIST_ADD' } },
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
                movie: { _id: 1, title: 1 },
                adds: '$count'
              }
            }
          ]
        }
      }
    ];

    const results = await Activity.aggregate(pipeline);
    return results[0];
  }

  async getEngagementStats(dateFilter) {
    const pipeline = [
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ];

    const activityCounts = await Activity.aggregate(pipeline);
    
    return activityCounts.reduce((acc, { _id, count }) => {
      acc[_id.toLowerCase()] = count;
      return acc;
    }, {});
  }

  async getGenreStats(dateFilter) {
    const pipeline = [
      { $match: { createdAt: dateFilter } },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      { $unwind: '$movie.genres' },
      {
        $group: {
          _id: '$movie.genres',
          views: {
            $sum: { $cond: [{ $eq: ['$type', 'MOVIE_VIEW'] }, 1, 0] }
          },
          ratings: {
            $sum: { $cond: [{ $eq: ['$type', 'RATING_ADD'] }, 1, 0] }
          },
          watchlist: {
            $sum: { $cond: [{ $eq: ['$type', 'WATCHLIST_ADD'] }, 1, 0] }
          }
        }
      },
      { $sort: { views: -1 } }
    ];

    return await Activity.aggregate(pipeline);
  }

  async getActorStats(dateFilter) {
    const pipeline = [
      { $match: { type: 'ACTOR_SEARCH', createdAt: dateFilter } },
      {
        $group: {
          _id: '$actor',
          searchCount: { $sum: 1 }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'actors',
          localField: '_id',
          foreignField: '_id',
          as: 'actor'
        }
      },
      { $unwind: '$actor' },
      {
        $project: {
          _id: 0,
          actor: { _id: 1, name: 1, profilePhoto: 1 },
          searchCount: 1
        }
      }
    ];

    return await Activity.aggregate(pipeline);
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