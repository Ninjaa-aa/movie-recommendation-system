// src/api/v1/awards/award.service.js
const Award = require('../models/award.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class AwardService {
  async createAward(awardData) {
    try {
      const movie = await Movie.findById(awardData.movie);
      if (!movie) {
        throw new ApiError(404, 'Movie not found');
      }

      // Check for duplicate award
      const existingAward = await Award.findOne({
        movie: awardData.movie,
        organization: awardData.organization,
        category: awardData.category,
        year: awardData.year
      });

      if (existingAward) {
        throw new ApiError(400, 'Award already exists for this movie, category, and year');
      }

      const award = await Award.create(awardData);
      await movie.updateAwardStats();

      return await award.populate('movie', 'title releaseDate');
    } catch (error) {
      logger.error('Error creating award:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error creating award');
    }
  }

  async updateAward(awardId, updateData) {
    try {
      const award = await Award.findById(awardId);
      if (!award) {
        throw new ApiError(404, 'Award not found');
      }

      Object.assign(award, updateData);
      await award.save();

      const movie = await Movie.findById(award.movie);
      if (movie) {
        await movie.updateAwardStats();
      }

      return await award.populate('movie', 'title releaseDate');
    } catch (error) {
      logger.error('Error updating award:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error updating award');
    }
  }

  async getMovieAwards(movieId, filters = {}) {
    try {
      const query = {
        movie: movieId,
        isActive: true
      };

      if (filters.isWinner !== undefined) {
        query.isWinner = filters.isWinner;
      }

      if (filters.organization) {
        query.organization = filters.organization;
      }

      if (filters.year) {
        query.year = filters.year;
      }

      const awards = await Award.find(query)
        .sort({ year: -1, isWinner: -1, organization: 1 })
        .populate('movie', 'title releaseDate');

      return awards;
    } catch (error) {
      logger.error('Error fetching movie awards:', error);
      throw new ApiError(500, 'Error fetching movie awards');
    }
  }

  async getAwardsByYear(year, organization) {
    try {
      const query = { 
        year,
        isActive: true
      };

      if (organization) {
        query.organization = organization;
      }

      const awards = await Award.find(query)
        .populate('movie', 'title releaseDate coverPhoto')
        .sort({ organization: 1, category: 1 });

      return awards;
    } catch (error) {
      logger.error('Error fetching awards by year:', error);
      throw new ApiError(500, 'Error fetching awards');
    }
  }

  async getAwardWinners(organization, year) {
    try {
      const winners = await Award.find({
        organization,
        year,
        isWinner: true,
        isActive: true
      })
      .populate('movie', 'title releaseDate coverPhoto')
      .sort({ category: 1 });

      return winners;
    } catch (error) {
      logger.error('Error fetching award winners:', error);
      throw new ApiError(500, 'Error fetching award winners');
    }
  }

  async searchAwards(filters, page = 1, limit = 10) {
    try {
      const query = { isActive: true };

      if (filters.organization) query.organization = filters.organization;
      if (filters.category) query.category = filters.category;
      if (filters.year) query.year = filters.year;
      if (filters.isWinner !== undefined) query.isWinner = filters.isWinner;
      if (filters.recipient) {
        query['recipients.name'] = { $regex: filters.recipient, $options: 'i' };
      }
      if (filters.movie) query.movie = filters.movie;

      const awards = await Award.find(query)
        .populate('movie', 'title releaseDate coverPhoto')
        .sort({ year: -1, organization: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Award.countDocuments(query);

      return {
        results: awards,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error searching awards:', error);
      throw new ApiError(500, 'Error searching awards');
    }
  }

  async deleteAward(awardId) {
    try {
      const award = await Award.findById(awardId);
      if (!award) {
        throw new ApiError(404, 'Award not found');
      }

      // Store movie reference before deletion
      const movieId = award.movie;

      // Soft delete
      award.isActive = false;
      await award.save();

      // Update movie stats
      const movie = await Movie.findById(movieId);
      if (movie) {
        await movie.updateAwardStats();
      }

      return { message: 'Award deleted successfully' };
    } catch (error) {
      logger.error('Error deleting award:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error deleting award');
    }
  }

  async getMajorAwardStats(movieId) {
    try {
      const awards = await Award.find({
        movie: movieId,
        isActive: true,
        organization: { 
          $in: ['Academy Awards', 'Golden Globes', 'BAFTA'] 
        }
      });

      const stats = {
        oscars: { wins: 0, nominations: 0 },
        goldenGlobes: { wins: 0, nominations: 0 },
        bafta: { wins: 0, nominations: 0 }
      };

      awards.forEach(award => {
        switch(award.organization) {
          case 'Academy Awards':
            stats.oscars.nominations++;
            if (award.isWinner) stats.oscars.wins++;
            break;
          case 'Golden Globes':
            stats.goldenGlobes.nominations++;
            if (award.isWinner) stats.goldenGlobes.wins++;
            break;
          case 'BAFTA':
            stats.bafta.nominations++;
            if (award.isWinner) stats.bafta.wins++;
            break;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Error fetching major award stats:', error);
      throw new ApiError(500, 'Error fetching major award stats');
    }
  }
}

module.exports = new AwardService();