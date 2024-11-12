// src/api/v1/box-office/boxOffice.service.js
const BoxOffice = require('../models/boxOffice.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class BoxOfficeService {
  async createBoxOffice(movieId, boxOfficeData) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      const existingBoxOffice = await BoxOffice.findOne({ movie: movieId });
      if (existingBoxOffice) {
        throw new ApiError(400, 'Box office data already exists for this movie');
      }

      const boxOffice = await BoxOffice.create({
        movie: movieId,
        ...boxOfficeData
      });

      return await boxOffice.populate('movie', 'title releaseDate');
    } catch (error) {
      logger.error('Error creating box office data:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error creating box office data');
    }
  }

  async updateBoxOffice(movieId, updateData) {
    try {
      const boxOffice = await BoxOffice.findOne({ movie: movieId });
      if (!boxOffice) {
        throw new ApiError(404, 'Box office data not found');
      }

      Object.assign(boxOffice, updateData);
      await boxOffice.save();

      return await boxOffice.populate('movie', 'title releaseDate');
    } catch (error) {
      logger.error('Error updating box office data:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error updating box office data');
    }
  }

  async getBoxOffice(movieId) {
    try {
      const boxOffice = await BoxOffice.findOne({ movie: movieId })
        .populate('movie', 'title releaseDate');

      if (!boxOffice) {
        throw new ApiError(404, 'Box office data not found');
      }

      return boxOffice;
    } catch (error) {
      logger.error('Error fetching box office data:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error fetching box office data');
    }
  }

  async getTopGrossing(period = 'all-time', limit = 10) {
    try {
      let query = {};
      const now = new Date();

      switch (period) {
        case 'week':
          query['openingWeekend.date'] = {
            $gte: new Date(now.setDate(now.getDate() - 7))
          };
          break;
        case 'month':
          query['openingWeekend.date'] = {
            $gte: new Date(now.setMonth(now.getMonth() - 1))
          };
          break;
        case 'year':
          query['openingWeekend.date'] = {
            $gte: new Date(now.setFullYear(now.getFullYear() - 1))
          };
          break;
      }

      const boxOfficeData = await BoxOffice.find(query)
        .populate('movie', 'title releaseDate')
        .sort({ 'totalEarnings.worldwide.amount': -1 })
        .limit(limit);

      return boxOfficeData;
    } catch (error) {
      logger.error('Error fetching top grossing movies:', error);
      throw new ApiError(500, 'Error fetching top grossing movies');
    }
  }

  async getWeeklyTrends() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyTrends = await BoxOffice.find({
        'weeklyEarnings.endDate': { $gte: oneWeekAgo }
      })
      .populate('movie', 'title releaseDate')
      .sort({ 'weeklyEarnings.worldwide.amount': -1 });

      return weeklyTrends;
    } catch (error) {
      logger.error('Error fetching weekly trends:', error);
      throw new ApiError(500, 'Error fetching weekly trends');
    }
  }
}

module.exports = new BoxOfficeService();