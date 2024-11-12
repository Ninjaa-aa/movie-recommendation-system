// src/api/v1/search/search.service.js
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError');

class SearchService {
  async searchMovies(filters, page = 1, limit = 10) {
    try {
      const query = this.buildSearchQuery(filters);
      const sortOptions = this.buildSortOptions(filters.sortBy);

      const movies = await Movie.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v');

      const total = await Movie.countDocuments(query);

      return {
        results: movies,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error searching movies');
    }
  }

  buildSearchQuery(filters) {
    const query = { isActive: true };

    // Full-text search
    if (filters.searchTerm) {
      query.$text = { $search: filters.searchTerm };
    }

    // Title search (partial match)
    if (filters.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }

    // Multiple genres
    if (filters.genre) {
      const genres = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
      query.genre = { $in: genres };
    }

    // Director search (partial match)
    if (filters.director) {
      query.director = { $regex: filters.director, $options: 'i' };
    }

    // Cast search
    if (filters.actor) {
      query['cast.name'] = { $regex: filters.actor, $options: 'i' };
    }

    // Rating range
    if (filters.minRating || filters.maxRating) {
      query.avgRating = {};
      if (filters.minRating) query.avgRating.$gte = parseFloat(filters.minRating);
      if (filters.maxRating) query.avgRating.$lte = parseFloat(filters.maxRating);
    }

    // Popularity threshold
    if (filters.minPopularity) {
      query.popularity = { $gte: parseFloat(filters.minPopularity) };
    }

    // Release date range
    if (filters.releaseYear) {
      const year = parseInt(filters.releaseYear);
      query.releaseDate = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      };
    } else if (filters.decade) {
      const decade = parseInt(filters.decade);
      query.releaseDate = {
        $gte: new Date(`${decade}-01-01`),
        $lte: new Date(`${decade + 9}-12-31`)
      };
    } else if (filters.fromDate && filters.toDate) {
      query.releaseDate = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate)
      };
    }

    // Country filter
    if (filters.country) {
      query.country = { $regex: filters.country, $options: 'i' };
    }

    // Language filter
    if (filters.language) {
      query.language = filters.language;
    }

    // Keywords search
    if (filters.keywords) {
      const keywordList = filters.keywords.split(',').map(k => k.trim());
      query.keywords = { $in: keywordList };
    }

    // Age rating filter
    if (filters.ageRating) {
      query.ageRating = { $in: Array.isArray(filters.ageRating) ? filters.ageRating : [filters.ageRating] };
    }

    return query;
  }

  buildSortOptions(sortBy) {
    const sortOptions = {};

    switch (sortBy) {
      case 'releaseDate':
        sortOptions.releaseDate = -1;
        break;
      case 'rating':
        sortOptions.avgRating = -1;
        sortOptions.ratingCount = -1;
        break;
      case 'popularity':
        sortOptions.popularity = -1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      case 'mostViewed':
        sortOptions.viewCount = -1;
        break;
      default:
        // Default sort by popularity and rating
        sortOptions.popularity = -1;
        sortOptions.avgRating = -1;
        break;
    }

    return sortOptions;
  }

  async getTopMovies(criteria, page = 1, limit = 10) {
    try {
      const { period, genre, type } = criteria;
      const query = { isActive: true };
      const dateRange = this.getDateRangeForPeriod(period);

      if (dateRange) {
        query.releaseDate = dateRange;
      }

      if (genre) {
        query.genre = genre;
      }

      // Different types of top lists
      let sortOptions = {};
      switch (type) {
        case 'rating':
          query.ratingCount = { $gte: 10 }; // Minimum ratings threshold
          sortOptions = { avgRating: -1, ratingCount: -1 };
          break;
        case 'popular':
          sortOptions = { popularity: -1 };
          break;
        case 'trending':
          sortOptions = { viewCount: -1 };
          break;
        default:
          sortOptions = { avgRating: -1 };
      }

      const movies = await Movie.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v');

      const total = await Movie.countDocuments(query);

      return {
        results: movies,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching top movies');
    }
  }

  getDateRangeForPeriod(period) {
    if (!period) return null;

    const now = new Date();
    const range = { $lte: now };

    switch (period) {
      case 'week':
        range.$gte = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        range.$gte = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        range.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all_time':
        return null;
      default:
        return null;
    }

    return range;
  }

  // Helper method to update movie popularity based on various factors
  async updatePopularity(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) return;

    // Calculate popularity based on various factors
    const viewWeight = 1;
    const ratingWeight = 2;
    const recentWeight = movie.releaseDate > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? 1.5 : 1;

    const popularity = (
      (movie.viewCount * viewWeight +
        movie.ratingCount * ratingWeight) *
      recentWeight
    );

    await Movie.findByIdAndUpdate(movieId, { popularity });
  }
}

module.exports = new SearchService();