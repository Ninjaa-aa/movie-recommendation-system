// src/models/moderationQueue.model.js
const mongoose = require('mongoose');

const moderationQueueSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['REVIEW', 'FORUM_POST', 'FORUM_TOPIC', 'USER_REPORT']
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationNotes: String,
  moderatedAt: Date
}, {
  timestamps: true
});

moderationQueueSchema.index({ status: 1, createdAt: -1 });
moderationQueueSchema.index({ type: 1, status: 1 });
moderationQueueSchema.index({ moderator: 1, status: 1 });

const ModerationQueue = mongoose.model('ModerationQueue', moderationQueueSchema);

module.exports = {
  ModerationQueue
};