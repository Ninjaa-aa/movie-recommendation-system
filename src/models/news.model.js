// src/models/news.model.js
const mongoose = require('mongoose');
const { Types } = mongoose;

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true,
    maxLength: 300
  },
  category: {
    type: String,
    required: true,
    enum: ['movie-news', 'actor-news', 'industry-updates', 'upcoming-projects', 'box-office']
  },
  coverImage: {
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    validate: {
      validator: function(v) {
        return Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid ObjectId!`
    }
  }],
  relatedActors: [{
    name: String,
    role: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  source: {
    name: String,
    url: String
  }
}, {
  timestamps: true
});

// Create text index for search
newsSchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text',
  'relatedActors.name': 'text'
});

// Create compound indexes for querying
newsSchema.index({ category: 1, publishDate: -1 });
newsSchema.index({ isPublished: 1, publishDate: -1 });
newsSchema.index({ isHighlighted: 1, publishDate: -1 });
newsSchema.index({ tags: 1, publishDate: -1 });

// Pre-save middleware to generate slug
newsSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const News = mongoose.model('News', newsSchema);
module.exports = News;