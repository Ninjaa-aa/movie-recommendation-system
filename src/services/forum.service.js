const mongoose = require('mongoose');
const slugify = require('slugify');
const Forum = require('../models/forum.model'); // Separate model files
const Topic = require('../models/topic.model');
const Post = require('../models/post.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class ForumService {
  /**
   * Create a new forum
   * @param {Object} forumData Forum data
   * @returns {Promise<Object>} Created forum
   */
  async createForum(forumData) {
    try {
      // Validate movie ID if provided
      if (forumData.movie && !mongoose.Types.ObjectId.isValid(forumData.movie)) {
        throw new ApiError(400, 'Invalid movie ID');
      }

      // Validate moderator IDs
      if (forumData.moderators?.length) {
        const invalidModerators = forumData.moderators.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidModerators.length) {
          throw new ApiError(400, 'Invalid moderator ID(s)');
        }
      }

      // Create slug from name
      const slug = slugify(forumData.name, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      // Check for existing forum with same slug
      const existingForum = await Forum.findOne({ 
        slug,
        isActive: true 
      });

      if (existingForum) {
        throw new ApiError(409, 'A forum with this name already exists');
      }

      // Create new forum
      const forum = await Forum.create({
        ...forumData,
        slug,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Populate references and return
      return await forum.populate([
        { 
          path: 'moderators', 
          select: 'name avatar email',
          match: { isActive: true }
        },
        { 
          path: 'movie', 
          select: 'title releaseDate posterUrl',
          match: { isActive: true }
        }
      ]);
    } catch (error) {
      logger.error('Error creating forum:', error);
      if (error instanceof ApiError) throw error;
      if (error.code === 11000) {
        throw new ApiError(409, 'A forum with this name already exists');
      }
      throw new ApiError(500, 'Failed to create forum');
    }
  }

  /**
   * Update an existing forum
   * @param {string} forumId Forum ID
   * @param {Object} updateData Update data
   * @returns {Promise<Object>} Updated forum
   */
  async updateForum(forumId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, 'Invalid forum ID');
      }

      const forum = await Forum.findOne({ 
        _id: forumId,
        isActive: true 
      });

      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      // Handle name/slug update
      if (updateData.name) {
        const slug = slugify(updateData.name, { 
          lower: true, 
          strict: true,
          remove: /[*+~.()'"!:@]/g
        });
        
        const existingForum = await Forum.findOne({ 
          slug, 
          _id: { $ne: forumId },
          isActive: true
        });
        
        if (existingForum) {
          throw new ApiError(409, 'A forum with this name already exists');
        }
        
        forum.slug = slug;
      }

      // Update fields
      Object.assign(forum, {
        ...updateData,
        updatedAt: new Date()
      });

      await forum.save();

      // Populate and return
      return await forum.populate([
        { 
          path: 'moderators', 
          select: 'name avatar email',
          match: { isActive: true }
        },
        { 
          path: 'movie', 
          select: 'title releaseDate posterUrl',
          match: { isActive: true }
        },
        { 
          path: 'lastPost',
          match: { isActive: true },
          populate: [
            { 
              path: 'author', 
              select: 'name avatar',
              match: { isActive: true }
            },
            { 
              path: 'topic', 
              select: 'title',
              match: { isActive: true }
            }
          ]
        }
      ]);
    } catch (error) {
      logger.error('Error updating forum:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update forum');
    }
  }

  /**
   * List all forums with filters
   * @param {Object} filters Filter criteria
   * @param {number} page Page number
   * @param {number} limit Items per page
   * @returns {Promise<Object>} Forums list with pagination
   */
  async listForums(filters = {}, page = 1, limit = 20) {
    try {
      const query = { isActive: true };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.movie && mongoose.Types.ObjectId.isValid(filters.movie)) {
        query.movie = filters.movie;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Execute query with pagination
      const [forums, total] = await Promise.all([
        Forum.find(query)
          .populate([
            { 
              path: 'moderators', 
              select: 'name avatar email',
              match: { isActive: true }
            },
            { 
              path: 'movie', 
              select: 'title releaseDate posterUrl',
              match: { isActive: true }
            },
            { 
              path: 'lastPost',
              match: { isActive: true },
              populate: [
                { 
                  path: 'author', 
                  select: 'name avatar',
                  match: { isActive: true }
                },
                { 
                  path: 'topic', 
                  select: 'title',
                  match: { isActive: true }
                }
              ]
            }
          ])
          .sort({ category: 1, name: 1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Forum.countDocuments(query)
      ]);

      return {
        results: forums,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error listing forums:', error);
      throw new ApiError(500, 'Failed to list forums');
    }
  }

  /**
   * Get forum by ID
   * @param {string} forumId Forum ID
   * @returns {Promise<Object>} Forum details
   */
  async getForum(forumId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, 'Invalid forum ID');
      }

      const forum = await Forum.findOne({ 
        _id: forumId,
        isActive: true 
      }).populate([
        { 
          path: 'moderators', 
          select: 'name avatar email',
          match: { isActive: true }
        },
        { 
          path: 'movie', 
          select: 'title releaseDate posterUrl',
          match: { isActive: true }
        },
        { 
          path: 'lastPost',
          match: { isActive: true },
          populate: [
            { 
              path: 'author', 
              select: 'name avatar',
              match: { isActive: true }
            },
            { 
              path: 'topic', 
              select: 'title',
              match: { isActive: true }
            }
          ]
        }
      ]);

      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      return forum;
    } catch (error) {
      logger.error('Error getting forum:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to get forum details');
    }
  }

  /**
   * Delete forum and associated content
   * @param {string} forumId Forum ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteForum(forumId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(forumId)) {
        throw new ApiError(400, 'Invalid forum ID');
      }

      const forum = await Forum.findOne({
        _id: forumId,
        isActive: true
      });

      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      try {
        // Soft delete forum
        forum.isActive = false;
        await forum.save();

        // Get all topics for this forum
        const topics = await Topic.find({ 
          forum: forumId,
          isActive: true 
        });

        // Soft delete topics
        for (const topic of topics) {
          topic.isActive = false;
          await topic.save();

          // Soft delete associated posts
          await Post.updateMany(
            { topic: topic._id, isActive: true },
            { isActive: false }
          );
        }

        return { 
          success: true,
          message: 'Forum and associated content deleted successfully',
          deletedForumId: forumId
        };
      } catch (error) {
        logger.error('Error in delete operations:', error);
        throw new ApiError(500, 'Error while deleting forum content');
      }
    } catch (error) {
      logger.error('Error deleting forum:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete forum');
    }
  }
}

module.exports = ForumService;