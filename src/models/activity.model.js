const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'MOVIE_VIEW', 
      'MOVIE_SEARCH', 
      'ACTOR_SEARCH', 
      'REVIEW_CREATE',
      'REVIEW_LIKE',
      'WATCHLIST_ADD',
      'RATING_ADD',
      'FORUM_POST',
      'FORUM_TOPIC'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actor'
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  forumPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  forumTopic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ movie: 1, type: 1, createdAt: -1 });
activitySchema.index({ actor: 1, type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
