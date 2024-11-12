// src/api/v1/news/news.service.js
const mongoose = require('mongoose');
const News = require('../models/news.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class NewsService {
  async createNews(newsData, authorId) {
    try {
      logger.debug('Creating news with data:', newsData);

      // Format tags - handle comma-separated string in array
      const tags = Array.isArray(newsData.tags) 
        ? newsData.tags[0].split(',').map(tag => tag.trim())
        : [];

      // Format relatedMovies - handle comma-separated string in array and validate ObjectIds
      const relatedMovies = Array.isArray(newsData.relatedMovies)
        ? newsData.relatedMovies[0].split(',')
          .map(id => id.trim())
          .filter(id => mongoose.Types.ObjectId.isValid(id))
        : [];

      // Format relatedActors - ensure proper structure
      const relatedActors = Array.isArray(newsData.relatedActors)
        ? newsData.relatedActors
        : typeof newsData.relatedActors === 'string'
          ? JSON.parse(newsData.relatedActors)
          : [];

      // Format boolean value
      const isHighlighted = newsData.isHighlighted === 'true' || newsData.isHighlighted === true;

      // Format source - ensure proper structure
      const source = typeof newsData.source === 'string'
        ? JSON.parse(newsData.source)
        : newsData.source;

      // Generate slug from title
      const slug = newsData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const formattedData = {
        title: newsData.title,
        slug,
        content: newsData.content,
        summary: newsData.summary,
        category: newsData.category,
        tags,
        relatedMovies: relatedMovies.map(id => new mongoose.Types.ObjectId(id)),
        relatedActors,
        source,
        isHighlighted,
        author: authorId,
        isPublished: true,
        publishDate: new Date()
      };

      logger.debug('Formatted data:', formattedData);

      const news = await News.create(formattedData);

      return await news.populate([
        { path: 'author', select: 'name email' },
        { path: 'relatedMovies', select: 'title releaseDate' }
      ]);
    } catch (error) {
      logger.error('Error in createNews:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ApiError(422, error.message);
      }
      
      if (error instanceof SyntaxError) {
        throw new ApiError(422, 'Invalid JSON format in request data');
      }

      if (error.code === 11000) { // Duplicate key error
        throw new ApiError(409, 'News article with this title already exists');
      }

      throw new ApiError(500, `Error creating news article: ${error.message}`);
    }
  }

  async updateNews(newsId, updateData, authorId) {
    try {
      const news = await News.findOne({ _id: newsId, author: authorId });
      if (!news) {
        throw new ApiError(404, 'News article not found or unauthorized');
      }

      // Format data if provided
      if (updateData.tags) {
        updateData.tags = Array.isArray(updateData.tags)
          ? updateData.tags[0].split(',').map(tag => tag.trim())
          : [];
      }

      if (updateData.relatedMovies) {
        const movieIds = Array.isArray(updateData.relatedMovies)
          ? updateData.relatedMovies[0].split(',')
            .map(id => id.trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id))
          : [];
        updateData.relatedMovies = movieIds.map(id => new mongoose.Types.ObjectId(id));
      }

      if (updateData.relatedActors) {
        updateData.relatedActors = Array.isArray(updateData.relatedActors)
          ? updateData.relatedActors
          : typeof updateData.relatedActors === 'string'
            ? JSON.parse(updateData.relatedActors)
            : [];
      }

      if (updateData.isHighlighted !== undefined) {
        updateData.isHighlighted = updateData.isHighlighted === 'true' || updateData.isHighlighted === true;
      }

      if (updateData.source) {
        updateData.source = typeof updateData.source === 'string'
          ? JSON.parse(updateData.source)
          : updateData.source;
      }

      if (updateData.title) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      Object.assign(news, updateData);
      await news.save();

      return await news.populate([
        { path: 'author', select: 'name email' },
        { path: 'relatedMovies', select: 'title releaseDate' }
      ]);
    } catch (error) {
      logger.error('Error in updateNews:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ApiError(422, error.message);
      }
      
      if (error instanceof ApiError) throw error;
      
      throw new ApiError(500, `Error updating news article: ${error.message}`);
    }
  }

  async deleteNews(newsId, authorId) {
    try {
      const news = await News.findOneAndUpdate(
        { _id: newsId, author: authorId },
        { isPublished: false },
        { new: true }
      );

      if (!news) {
        throw new ApiError(404, 'News article not found or unauthorized');
      }

      return { message: 'News article deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting news article');
    }
  }

  async getNews(filters = {}, page = 1, limit = 10) {
    try {
      const query = { isPublished: true };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.tag) {
        query.tags = filters.tag;
      }

      if (filters.searchTerm) {
        query.$text = { $search: filters.searchTerm };
      }

      if (filters.highlighted) {
        query.isHighlighted = true;
      }

      const news = await News.find(query)
        .populate([
          { path: 'author', select: 'name' },
          { path: 'relatedMovies', select: 'title releaseDate' }
        ])
        .sort({ publishDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await News.countDocuments(query);

      return {
        results: news,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching news articles');
    }
  }

  async getNewsById(newsId) {
    try {
      const news = await News.findOneAndUpdate(
        { _id: newsId, isPublished: true },
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate([
        { path: 'author', select: 'name' },
        { path: 'relatedMovies', select: 'title releaseDate coverPhoto' }
      ]);

      if (!news) {
        throw new ApiError(404, 'News article not found');
      }

      return news;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching news article');
    }
  }

  async getNewsBySlug(slug) {
    try {
      const news = await News.findOneAndUpdate(
        { slug, isPublished: true },
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate([
        { path: 'author', select: 'name' },
        { path: 'relatedMovies', select: 'title releaseDate coverPhoto' }
      ]);

      if (!news) {
        throw new ApiError(404, 'News article not found');
      }

      return news;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching news article');
    }
  }

  async getRelatedNews(newsId, limit = 5) {
    try {
      const news = await News.findById(newsId);
      if (!news) {
        throw new ApiError(404, 'News article not found');
      }

      // Find related news based on category and tags
      const relatedNews = await News.find({
        _id: { $ne: newsId },
        isPublished: true,
        $or: [
          { category: news.category },
          { tags: { $in: news.tags } }
        ]
      })
      .select('title slug summary category publishDate coverImage')
      .sort({ publishDate: -1 })
      .limit(limit)
      .lean();

      return relatedNews;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching related news');
    }
  }

  async getTrendingNews(limit = 5) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const trendingNews = await News.find({
        isPublished: true,
        publishDate: { $gte: oneWeekAgo }
      })
      .select('title slug summary category publishDate coverImage viewCount')
      .sort({ viewCount: -1, publishDate: -1 })
      .limit(limit)
      .lean();

      return trendingNews;
    } catch (error) {
      throw new ApiError(500, 'Error fetching trending news');
    }
  }
}

module.exports = new NewsService();