// src/api/v1/boxOffice/boxOffice.service.js
const BoxOffice = require('../../../models/boxOffice.model');
const Movie = require('../../../models/movie.model');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../utils/logger');

class BoxOfficeService {
  async createBoxOffice(movieId, boxOfficeData) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      const existingBoxOffice = await BoxOffice.findOne({ movieId });
      if (existingBoxOffice) {
        throw new ApiError(400, 'Box office data already exists for this movie');
      }

      const boxOffice = await BoxOffice.create({
        movieId,
        ...boxOfficeData
      });

      // Update movie stats
      await movie.updateBoxOfficeStats();

      return await boxOffice.populate('movieId', 'title releaseDate');
    } catch (error) {
      logger.error('Error creating box office data:', error);
      throw new ApiError(500, 'Error creating box office data');
    }
  }

  async updateBoxOffice(movieId, updateData) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      const boxOffice = await BoxOffice.findOne({ movieId });
      if (!boxOffice) {
        throw new ApiError(404, 'Box office data not found');
      }

      // Update total earnings and set lastUpdated
      if (updateData.totalEarnings) {
        updateData.totalEarnings.lastUpdated = new Date();
      }

      // Add weekly earnings if provided
      if (updateData.weeklyEarnings) {
        boxOffice.weeklyEarnings = [
          ...boxOffice.weeklyEarnings,
          ...updateData.weeklyEarnings
        ].sort((a, b) => a.week - b.week);
      }

      Object.assign(boxOffice, updateData);
      await boxOffice.save();

      // Update movie stats
      await movie.updateBoxOfficeStats();

      // Update movie popularity
      if (updateData.totalEarnings?.worldwide) {
        await movie.save(); // This triggers the popularity calculation
      }

      return await boxOffice.populate('movieId', 'title releaseDate');
    } catch (error) {
      logger.error('Error updating box office data:', error);
      throw new ApiError(500, 'Error updating box office data');
    }
  }

  async getBoxOfficeByMovie(movieId) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      const boxOffice = await BoxOffice.findOne({ movieId, isActive: true })
        .populate('movieId', 'title releaseDate avgRating popularity');

      if (!boxOffice) {
        throw new ApiError(404, 'Box office data not found');
      }

      return boxOffice;
    } catch (error) {
      logger.error('Error fetching box office data:', error);
      throw new ApiError(500, 'Error fetching box office data');
    }
  }

  async getTopGrossing(period = 'all-time', limit = 10) {
    try {
      const query = { isActive: true };

      if (period !== 'all-time') {
        const startDate = new Date();
        switch (period) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        query['openingWeekend.date'] = { $gte: startDate };
      }

      const boxOfficeData = await BoxOffice.find(query)
        .populate('movieId', 'title releaseDate coverPhoto avgRating popularity')
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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const trends = await BoxOffice.find({
        isActive: true,
        'weeklyEarnings.startDate': { $gte: startDate }
      })
      .populate('movieId', 'title releaseDate coverPhoto avgRating popularity')
      .sort({ 'weeklyEarnings.worldwide.amount': -1 });

      return trends;
    } catch (error) {
      logger.error('Error fetching weekly trends:', error);
      throw new ApiError(500, 'Error fetching weekly trends');
    }
  }

  // Helper method to update movie stats after significant changes
  async updateMovieStats(movieId) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      await movie.updateBoxOfficeStats();
      await movie.save();

      return movie;
    } catch (error) {
      logger.error('Error updating movie stats:', error);
      throw new ApiError(500, 'Error updating movie stats');
    }
  }
}

module.exports = new BoxOfficeService();