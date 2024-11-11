// src/api/v1/awards/award.service.js
const Award = require('../../../models/award.model');
const Movie = require('../../../models/movie.model');
const ApiError = require('../../../utils/ApiError');

class AwardService {
  async createAward(awardData) {
    try {
      logger.debug('Starting award creation', awardData);

      // Verify movie if provided
      if (awardData.movie) {
        const movie = await Movie.findById(awardData.movie);
        if (!movie) {
          logger.error('Movie not found', { movieId: awardData.movie });
          throw new ApiError(404, 'Movie not found');
        }
        logger.debug('Movie found', { movieId: movie._id });
      }

      // Create award
      const award = new Award(awardData);
      const savedAward = await award.save();
      logger.debug('Award saved', savedAward);

      // Populate movie details if present
      if (savedAward.movie) {
        await savedAward.populate('movie', 'title releaseDate');
      }

      return savedAward;
    } catch (error) {
      logger.error('Error in createAward service', error);
      if (error.name === 'ValidationError') {
        throw new ApiError(400, 'Validation Error', error.errors);
      }
      throw error;
    }
  }

  async updateAward(awardId, updateData) {
    console.log('Starting award update process...');
    
    try {
      const existingAward = await Award.findById(awardId);
      if (!existingAward) {
        throw new ApiError(404, 'Award not found');
      }

      // If movie is being changed, handle both old and new movie stats
      if (updateData.movie && updateData.movie !== existingAward.movie?.toString()) {
        // Verify new movie exists
        const newMovie = await Movie.findById(updateData.movie);
        if (!newMovie) {
          throw new ApiError(404, 'New movie not found');
        }

        // Update old movie's stats if it exists
        if (existingAward.movie) {
          const oldMovie = await Movie.findById(existingAward.movie);
          if (oldMovie) {
            oldMovie.awards.pull(awardId);
            await oldMovie.updateAwardStats();
          }
        }

        // Update new movie's stats
        newMovie.awards.addToSet(awardId);
        await newMovie.updateAwardStats();
      }

      // Update the award
      const updatedAward = await Award.findByIdAndUpdate(
        awardId,
        { ...updateData },
        { new: true, runValidators: true }
      ).populate('movie', 'title releaseDate genre director avgRating');

      return updatedAward;
    } catch (error) {
      console.error('Error in updateAward service:', error);
      if (error.name === 'ValidationError') {
        throw new ApiError(400, 'Validation Error', error.errors);
      }
      throw error;
    }
  }

  async getMovieAwards(movieId) {
    try {
      const awards = await Award.find({
        movie: movieId,
        isActive: true
      }).sort({ year: -1, isWinner: -1 });

      return awards;
    } catch (error) {
      throw new ApiError(500, 'Error fetching movie awards');
    }
  }

  async getAwardsByYear(year, organization) {
    try {
      const query = { year, isActive: true };
      if (organization) {
        query.organization = organization;
      }

      const awards = await Award.find(query)
        .populate('movie', 'title releaseDate')
        .sort({ isWinner: -1 });

      return awards;
    } catch (error) {
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
      .populate('movie', 'title releaseDate')
      .sort({ category: 1 });

      return winners;
    } catch (error) {
      throw new ApiError(500, 'Error fetching award winners');
    }
  }

  async searchAwards(searchParams) {
    try {
      const {
        organization,
        category,
        year,
        isWinner,
        recipient,
        movie,
        page = 1,
        limit = 10
      } = searchParams;

      const query = { isActive: true };

      if (organization) query.organization = organization;
      if (category) query.category = category;
      if (year) query.year = year;
      if (isWinner !== undefined) query.isWinner = isWinner;
      if (recipient) query['recipients.name'] = { $regex: recipient, $options: 'i' };
      if (movie) query.movie = movie;

      const awards = await Award.find(query)
        .populate('movie', 'title releaseDate')
        .sort({ year: -1, isWinner: -1 })
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
      throw new ApiError(500, 'Error searching awards');
    }
  }
}

module.exports = new AwardService();