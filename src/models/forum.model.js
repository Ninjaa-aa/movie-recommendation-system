// src/models/forum.model.js
const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['MOVIES', 'ACTORS', 'DIRECTORS', 'GENRES', 'GENERAL'],
    default: 'GENERAL'
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: function() {
      return this.category === 'MOVIES';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalTopics: {
    type: Number,
    default: 0
  },
  totalPosts: {
    type: Number,
    default: 0
  },
  lastPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  timestamps: true
});

// Indexes
forumSchema.index({ slug: 1 });
forumSchema.index({ category: 1 });
forumSchema.index({ movie: 1 });
forumSchema.index({ name: 'text', description: 'text' });

const Forum = mongoose.model('Forum', forumSchema);