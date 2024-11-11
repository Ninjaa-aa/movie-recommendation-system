// src/models/post.model.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 10000
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'LINK'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    caption: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ topic: 1, createdAt: 1 });
postSchema.index({ author: 1 });
postSchema.index({ parentPost: 1 });
postSchema.index({ content: 'text' });
postSchema.index({ mentions: 1 });

const Post = mongoose.model('Post', postSchema);

