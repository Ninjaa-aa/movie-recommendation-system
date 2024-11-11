const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  lastReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  lastReplyAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
topicSchema.index({ forum: 1, createdAt: -1 });
topicSchema.index({ slug: 1 }, { unique: true });
topicSchema.index({ tags: 1 });
topicSchema.index({ title: 'text', content: 'text' });
topicSchema.index({ isActive: 1 });
topicSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual fields
topicSchema.virtual('shortContent').get(function() {
  return this.content.length > 200 ? 
    `${this.content.substring(0, 200)}...` : 
    this.content;
});

// Update lastReplyAt when lastReply is set
topicSchema.pre('save', function(next) {
  if (this.isModified('lastReply')) {
    this.lastReplyAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Topic', topicSchema);