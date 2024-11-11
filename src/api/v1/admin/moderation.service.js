// src/api/v1/admin/moderation.service.js
const { ModerationQueue } = require('../../../models/moderationQueue.model');

class ModerationService {
  async getModrationQueue(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};
      
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.moderator) query.moderator = filters.moderator;

      const items = await ModerationQueue.find(query)
        .populate([
          { path: 'content' },
          { path: 'reporter', select: 'name avatar' },
          { path: 'moderator', select: 'name avatar' }
        ])
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await ModerationQueue.countDocuments(query);

      return {
        results: items,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching moderation queue');
    }
  }

  async moderateContent(itemId, moderatorId, decision, notes) {
    try {
      const item = await ModerationQueue.findById(itemId);
      if (!item) {
        throw new ApiError(404, 'Moderation item not found');
      }

      item.status = decision;
      item.moderator = moderatorId;
      item.moderationNotes = notes;
      item.moderatedAt = new Date();

      await item.save();

      // Apply moderation action
      switch (item.type) {
        case 'REVIEW':
          await this.moderateReview(item.content, decision);
          break;
        case 'FORUM_POST':
          await this.moderateForumPost(item.content, decision);
          break;
        case 'FORUM_TOPIC':
          await this.moderateForumTopic(item.content, decision);
          break;
        case 'USER_REPORT':
          await this.moderateUser(item.content, decision);
          break;
      }

      return item;
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError(500, 'Error moderating content');
    }
  }

  // Implement specific moderation actions
  async moderateReview(reviewId, decision) {
    const review = await Review.findById(reviewId);
    if (review) {
      review.isModerated = true;
      review.isActive = decision === 'APPROVED';
      await review.save();
    }
  }

  async moderateForumPost(postId, decision) {
    const post = await Post.findById(postId);
    if (post) {
      post.isModerated = true;
      post.isActive = decision === 'APPROVED';
      await post.save();
    }
  }

  async moderateForumTopic(topicId, decision) {
    const topic = await Topic.findById(topicId);
    if (topic) {
      topic.isModerated = true;
      topic.isActive = decision === 'APPROVED';
      await topic.save();
    }
  }

  async moderateUser(userId, decision) {
    const user = await User.findById(userId);
    if (user) {
      user.isModerated = true;
      user.isSuspended = decision === 'REJECTED';
      await user.save();
    }
  }
}

module.exports = ModerationService