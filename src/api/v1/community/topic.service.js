// src/api/v1/community/topic.service.js
class TopicService {
  async createTopic(forumId, userId, topicData) {
    try {
      const forum = await Forum.findOne({ _id: forumId, isActive: true });
      if (!forum) {
        throw new ApiError(404, 'Forum not found');
      }

      if (forum.isLocked) {
        throw new ApiError(403, 'This forum is locked');
      }

      const slug = slugify(`${topicData.title}-${Date.now()}`, { lower: true, strict: true });

      const topic = await Topic.create({
        ...topicData,
        slug,
        forum: forumId,
        author: userId
      });

      // Update forum statistics
      forum.totalTopics += 1;
      await forum.save();

      return await topic.populate([
        { path: 'author', select: 'name avatar' },
        { path: 'forum', select: 'name category' }
      ]);
    } catch (error) {
      logger.error('Error creating topic:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error creating topic');
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
      const isModerator = forum.moderators.includes(userId);
      if (!isModerator && topic.author.toString() !== userId) {
        throw new ApiError(403, 'Not authorized to update this topic');
      }

      if (updateData.title) {
        const slug = slugify(`${updateData.title}-${Date.now()}`, { lower: true, strict: true });
        topic.slug = slug;
      }

      Object.assign(topic, updateData);
      await topic.save();

      return await topic.populate([
        { path: 'author', select: 'name avatar' },
        { path: 'forum', select: 'name category' },
        { 
          path: 'lastReply',
          populate: { path: 'author', select: 'name avatar' }
        }
      ]);
    } catch (error) {
      logger.error('Error updating topic:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error updating topic');
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

      if (filters.tags) {
        query.tags = { $all: filters.tags };
      }

      if (filters.author) {
        query.author = filters.author;
      }

      const topics = await Topic.find(query)
        .populate([
          { path: 'author', select: 'name avatar' },
          { path: 'forum', select: 'name category' },
          { 
            path: 'lastReply',
            populate: { path: 'author', select: 'name avatar' }
          }
        ])
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Topic.countDocuments(query);

      return {
        results: topics,
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