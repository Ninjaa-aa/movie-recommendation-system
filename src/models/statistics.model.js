// src/models/statistics.model.js
const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['movie_view', 'search', 'genre_view', 'actor_view', 'user_engagement']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Movie', 'Actor', 'Genre', 'User']
  },
  count: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

statisticsSchema.index({ type: 1, entityId: 1 });
statisticsSchema.index({ type: 1, timestamp: -1 });
statisticsSchema.index({ entityType: 1, count: -1 });

const Statistics = mongoose.model('Statistics', statisticsSchema);
module.exports = Statistics;