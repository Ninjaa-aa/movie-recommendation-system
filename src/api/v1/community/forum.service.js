// src/api/v1/community/forum.service.js
const slugify = require('slugify');
const { Forum, Topic, Post } = require('../../../models/community.model');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../utils/logger');

class ForumService {
  async createForum(forumData) {
    try {
      const slug = slugify(forumData.name, { lower: true, strict: true });
      
      const existingForum = await Forum.findOne({ slug });
      if (existingForum) {
        throw new ApiError(400, 'A forum with this name already exists');
      }

      const forum = await Forum.create({
        ...forumData,
        slug
      });

      return await forum.populate([
        { path: 'moderators', select: 'name avatar' },
        { path: 'movie', select: 'title releaseDate' }
      ]);
    } catch (error) {
      logger.error('Error creating forum:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error creating forum');
    }
  }

  async updateForum(forumId, updateData) {
    try {
      const forum = await Forum.findById(forumId);
      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      if (updateData.name) {
        const slug = slugify(updateData.name, { lower: true, strict: true });
        const existingForum = await Forum.findOne({ 
          slug, 
          _id: { $ne: forumId } 
        });
        
        if (existingForum) {
          throw new ApiError(400, 'A forum with this name already exists');
        }
        
        forum.slug = slug;
      }

      Object.assign(forum, updateData);
      await forum.save();

      return await forum.populate([
        { path: 'moderators', select: 'name avatar' },
        { path: 'movie', select: 'title releaseDate' },
        { 
          path: 'lastPost',
          populate: [
            { path: 'author', select: 'name avatar' },
            { path: 'topic', select: 'title' }
          ]
        }
      ]);
    } catch (error) {
      logger.error('Error updating forum:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error updating forum');
    }
  }

  async listForums(filters = {}, page = 1, limit = 20) {
    try {
      const query = { isActive: true };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.movie) {
        query.movie = filters.movie;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const forums = await Forum.find(query)
        .populate([
          { path: 'moderators', select: 'name avatar' },
          { path: 'movie', select: 'title releaseDate' },
          { 
            path: 'lastPost',
            populate: [
              { path: 'author', select: 'name avatar' },
              { path: 'topic', select: 'title' }
            ]
          }
        ])
        .sort({ category: 1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Forum.countDocuments(query);

      return {
        results: forums,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error listing forums:', error);
      throw new ApiError(500, 'Error listing forums');
    }
  }
  async getForum(forumId) {
    try {
      const forum = await Forum.findOne({ 
        _id: forumId,
        isActive: true 
      }).populate([
        { path: 'moderators', select: 'name avatar' },
        { path: 'movie', select: 'title releaseDate' },
        { 
          path: 'lastPost',
          populate: [
            { path: 'author', select: 'name avatar' },
            { path: 'topic', select: 'title' }
          ]
        }
      ]);

      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      return forum;
    } catch (error) {
      logger.error('Error getting forum:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error getting forum');
    }
  }

  async deleteForum(forumId) {
    try {
      const forum = await Forum.findById(forumId);
      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      forum.isActive = false;
      await forum.save();

      // Soft delete all associated topics and posts
      await Topic.updateMany(
        { forum: forumId },
        { isActive: false }
      );

      await Post.updateMany(
        { topic: { $in: await Topic.find({ forum: forumId }).distinct('_id') } },
        { isActive: false }
      );

      return { message: 'Forum deleted successfully' };
    } catch (error) {
      logger.error('Error deleting forum:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error deleting forum');
    }
  }
}

module.exports = ForumService;