const slugify = require('slugify');
const Forum = require('../../../models/forum.model');
const Topic = require('../../../models/topic.model');
const logger = require('../../../utils/logger');
const ApiError = require('../../../utils/ApiError');

class TopicService {
  async createTopic(forumId, userId, topicData) {
    try {
      // Validate forum ID format
      if (!forumId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError(400, 'Invalid forum ID format');
      }

      const forum = await Forum.findOne({ _id: forumId, isActive: true });
      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      if (forum.isLocked) {
        throw new ApiError(403, 'This forum is locked');
      }

      const slug = slugify(`${topicData.title}-${Date.now()}`, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });

      const topic = await Topic.create({
        ...topicData,
        slug,
        forum: forumId,
        author: userId,
        isActive: true,
        views: 0,
        likes: 0,
        replies: 0
      });

      // Update forum statistics
      forum.totalTopics += 1;
      forum.lastTopic = topic._id;
      await forum.save();

      return await topic.populate([
        { path: 'author', select: 'username avatar' },
        { path: 'forum', select: 'name category' }
      ]);
    } catch (error) {
      logger.error('Error creating topic:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error creating topic');
    }
  }

  async updateTopic(topicId, userId, updateData) {
    try {
      const topic = await Topic.findOne({ _id: topicId, isActive: true });
      if (!topic) {
        throw new ApiError(404, 'Topic not found');
      }

      // Check if user is author or moderator
      const forum = await Forum.findById(topic.forum);
      if (!forum) {
        throw new ApiError(404, 'Associated forum not found');
      }

      const isModerator = forum.moderators.includes(userId);
      if (!isModerator && topic.author.toString() !== userId) {
        throw new ApiError(403, 'Not authorized to update this topic');
      }

      if (updateData.title) {
        const slug = slugify(`${updateData.title}-${Date.now()}`, { 
          lower: true, 
          strict: true,
          remove: /[*+~.()'"!:@]/g
        });
        topic.slug = slug;
      }

      Object.assign(topic, updateData);
      await topic.save();

      return await topic.populate([
        { path: 'author', select: 'username avatar' },
        { path: 'forum', select: 'name category' },
        { 
          path: 'lastReply',
          populate: { path: 'author', select: 'username avatar' }
        }
      ]);
    } catch (error) {
      logger.error('Error updating topic:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error updating topic');
    }
  }

  async listTopics(forumId, filters = {}, page = 1, limit = 20) {
    try {
      const query = { 
        forum: forumId,
        isActive: true 
      };

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $all: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
      }

      if (filters.author) {
        query.author = filters.author;
      }

      const sort = {};
      if (filters.sort === 'popular') {
        sort.likes = -1;
        sort.views = -1;
      } else if (filters.sort === 'active') {
        sort.lastReplyAt = -1;
      } else {
        // default to newest
        sort.createdAt = -1;
      }
      
      sort.isPinned = -1; // Always keep pinned topics at top

      const topics = await Topic.find(query)
        .populate({
          path: 'author',
          select: 'username profilePicture email',
          model: 'User'
        })
        .populate({
          path: 'forum',
          select: 'name category slug',
          model: 'Forum'
        })
        .populate({
          path: 'lastReply',
          populate: {
            path: 'author',
            select: 'username profilePicture',
            model: 'User'
          }
        })
        .select('-__v')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await Topic.countDocuments(query);

      // Transform the data to ensure proper structure
      const formattedTopics = topics.map(topic => ({
        ...topic,
        author: topic.author ? {
          id: topic.author._id,
          username: topic.author.username,
          profilePicture: topic.author.profilePicture
        } : null,
        forum: topic.forum ? {
          id: topic.forum._id,
          name: topic.forum.name,
          category: topic.forum.category,
          slug: topic.forum.slug
        } : null,
        lastReply: topic.lastReply ? {
          ...topic.lastReply,
          author: topic.lastReply.author ? {
            id: topic.lastReply.author._id,
            username: topic.lastReply.author.username,
            profilePicture: topic.lastReply.author.profilePicture
          } : null
        } : null,
        createdAt: topic.createdAt.toISOString(),
        updatedAt: topic.updatedAt.toISOString()
      }));

      return {
        results: formattedTopics,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error listing topics:', error);
      throw new ApiError(500, 'Error listing topics');
    }
  }
}

module.exports = TopicService;