const mongoose = require('mongoose');

const editHistorySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  editedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [editHistorySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
postSchema.index({ topic: 1, createdAt: 1 });
postSchema.index({ content: 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Pre-save middleware
postSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Any initialization logic for new posts
    this.isEdited = false;
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;