const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'MOVIE_VIEW',
      'RATING_ADD',
      'RATING_UPDATE',
      'WATCHLIST_ADD',
      'WATCHLIST_REMOVE',
      'REVIEW_ADD',
      'REVIEW_UPDATE',
      'ACTOR_SEARCH',
      'MOVIE_SEARCH',
      'LOGIN',
      'SIGNUP'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    index: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actor',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1 });
activitySchema.index({ movie: 1, type: 1 });
activitySchema.index({ actor: 1, type: 1 });

module.exports = mongoose.model('Activity', activitySchema);