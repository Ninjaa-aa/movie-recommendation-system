// src/utils/forumCleanup.js
const Forum = require('../models/forum.model');
const Topic = require('../models/topic.model');
const Post = require('../models/post.model');
const logger = require('./logger');

/**
 * Utility to fix inconsistent forum states
 */
class ForumCleanup {
  /**
   * Sync deletion states between forum, topics, and posts
   * @param {string} forumId Forum ID
   */
  static async syncDeletionStates(forumId) {
    try {
      const forum = await Forum.findById(forumId);
      if (!forum) return;

      const forumActive = forum.isActive;

      // Get all topics for this forum
      const topics = await Topic.find({ forum: forumId });
      const topicIds = topics.map(topic => topic._id);

      // Sync topics with forum state
      if (topics.length > 0) {
        await Topic.updateMany(
          { forum: forumId },
          { isActive: forumActive }
        );
      }

      // Sync posts with forum state
      if (topicIds.length > 0) {
        await Post.updateMany(
          { topic: { $in: topicIds } },
          { isActive: forumActive }
        );
      }

      logger.info(`Forum ${forumId} deletion states synchronized`);
    } catch (error) {
      logger.error('Error in forum cleanup:', error);
    }
  }

  /**
   * Clean up orphaned topics and posts
   */
  static async cleanupOrphans() {
    try {
      // Find topics with non-existent forums
      const orphanedTopics = await Topic.find({
        forum: { $exists: true },
        isActive: true
      });

      for (const topic of orphanedTopics) {
        const forumExists = await Forum.exists({ _id: topic.forum });
        if (!forumExists) {
          topic.isActive = false;
          await topic.save();
          
          // Deactivate associated posts
          await Post.updateMany(
            { topic: topic._id },
            { isActive: false }
          );
        }
      }

      // Find posts with non-existent topics
      const orphanedPosts = await Post.find({
        topic: { $exists: true },
        isActive: true
      });

      for (const post of orphanedPosts) {
        const topicExists = await Topic.exists({ _id: post.topic });
        if (!topicExists) {
          post.isActive = false;
          await post.save();
        }
      }

      logger.info('Orphaned forum content cleanup completed');
    } catch (error) {
      logger.error('Error in orphan cleanup:', error);
    }
  }
}

module.exports = ForumCleanup;