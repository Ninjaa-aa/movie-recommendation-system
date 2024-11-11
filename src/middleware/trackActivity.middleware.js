// src/middlewares/trackActivity.js
const { Activity } = require('../models/activity.model');

const trackActivity = (type) => async (req, res, next) => {
  try {
    if (req.user) {
      const activity = {
        type,
        user: req.user.id
      };

      // Add relevant references based on activity type
      if (req.params.movieId) activity.movie = req.params.movieId;
      if (req.params.actorId) activity.actor = req.params.actorId;
      if (req.params.reviewId) activity.review = req.params.reviewId;
      if (req.params.postId) activity.forumPost = req.params.postId;
      if (req.params.topicId) activity.forumTopic = req.params.topicId;

      // Add any additional metadata
      if (req.body) {
        activity.metadata = {
          ...req.body,
          // Remove sensitive fields
          password: undefined,
          email: undefined
        };
      }

      await Activity.create(activity);
    }
  } catch (error) {
    // Log error but don't stop the request
    console.error('Error tracking activity:', error);
  }
  next();
};

module.exports = { trackActivity };