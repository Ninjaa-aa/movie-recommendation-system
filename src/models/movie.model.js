// src/models/movie.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    index: true // Single index for direct title queries
  },
  genre: [{ 
    type: String, 
    required: true,
    enum: [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
      'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
      'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music',
      'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance',
      'Sci-Fi', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'
    ]
  }],
  director: { 
    type: String, 
    required: true,
    index: true // For director searches
  },
  cast: [{ 
    name: {
      type: String,
      index: true // For actor searches
    },
    role: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  releaseDate: { 
    type: Date, 
    required: true,
    index: true
  },
  releaseYear: {
    type: Number,
    index: true
  },
  decade: {
    type: Number,
    index: true
  },
  runtime: { 
    type: Number, 
    required: true 
  },
  synopsis: { 
    type: String, 
    required: true 
  },
  coverPhoto: { 
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  },
  language: {
    type: String,
    required: true,
    enum: [
      'English', 'Spanish', 'French', 'German', 'Italian',
      'Japanese', 'Korean', 'Chinese', 'Hindi', 'Other'
    ],
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Released', 'Coming Soon', 'In Production'],
    index: true
  },
  // Rating related fields
  avgRating: { 
    type: Number, 
    default: 0,
    index: true
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Popularity metrics
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: null,
    index: true
  },
  // Additional metadata
  keywords: [{
    type: String,
    index: true
  }],
  trivia: [{ 
    type: String 
  }],
  goofs: [{ 
    type: String 
  }],
  soundtrack: [{
    title: String,
    artist: String,
    duration: String
  }],
  awards: [{
    name: String,
    year: Number,
    category: String,
    recipient: String,
    isNomination: {
      type: Boolean,
      default: false
    }
  }],
  ageRating: { 
    type: String, 
    required: true,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient filtering and sorting
movieSchema.index({ isActive: 1, avgRating: -1 });
movieSchema.index({ isActive: 1, popularity: -1 });
movieSchema.index({ isActive: 1, releaseYear: -1 });
movieSchema.index({ isActive: 1, viewCount: -1 });
movieSchema.index({ isActive: 1, genre: 1 });
movieSchema.index({ isActive: 1, language: 1 });
movieSchema.index({ isActive: 1, country: 1 });
movieSchema.index({ isActive: 1, decade: 1 });
movieSchema.index({ isActive: 1, lastViewedAt: -1 });
movieSchema.index({ isActive: 1, 'awards.year': -1 });

// Text index for full-text search across multiple fields
movieSchema.index({
  title: 'text',
  director: 'text',
  'cast.name': 'text',
  synopsis: 'text',
  keywords: 'text'
}, {
  weights: {
    title: 10,
    'cast.name': 5,
    director: 5,
    keywords: 3,
    synopsis: 1
  },
  name: "MovieTextIndex"
});

// Pre-save middleware to set derived fields
movieSchema.pre('save', function(next) {
  // Set release year
  if (this.releaseDate) {
    this.releaseYear = this.releaseDate.getFullYear();
    this.decade = Math.floor(this.releaseYear / 10) * 10;
  }

  // Update popularity score
  if (this.isModified('viewCount') || this.isModified('totalRatings') || 
      this.isModified('reviewCount') || this.isModified('avgRating')) {
    const viewWeight = 1;
    const ratingWeight = 2;
    const reviewWeight = 1.5;
    const avgRatingWeight = 3;
    
    // Calculate days since release
    const daysSinceRelease = this.releaseDate ? 
      Math.max(0, (Date.now() - this.releaseDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Time decay factor (reduces popularity of older movies gradually)
    const timeDecay = Math.exp(-daysSinceRelease / 365); // Exponential decay over a year
    
    this.popularity = (
      (this.viewCount * viewWeight +
       this.totalRatings * ratingWeight +
       this.reviewCount * reviewWeight +
       (this.avgRating * this.totalRatings) * avgRatingWeight) *
      timeDecay
    );
  }

  next();
});

// Instance method to update view count
movieSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

// Static method to get trending movies
movieSchema.statics.getTrending = async function(options = {}) {
  const {
    period = 'week',
    limit = 10,
    genre = null
  } = options;

  const dateThreshold = new Date();
  switch(period) {
    case 'day':
      dateThreshold.setDate(dateThreshold.getDate() - 1);
      break;
    case 'week':
      dateThreshold.setDate(dateThreshold.getDate() - 7);
      break;
    case 'month':
      dateThreshold.setMonth(dateThreshold.getMonth() - 1);
      break;
  }

  const query = {
    isActive: true,
    lastViewedAt: { $gte: dateThreshold }
  };
  
  if (genre) {
    query.genre = genre;
  }

  return this.find(query)
    .sort({ popularity: -1 })
    .limit(limit);
};

// Static method to get top rated movies
movieSchema.statics.getTopRated = async function(options = {}) {
  const {
    minRatings = 10,
    limit = 10,
    genre = null
  } = options;

  const query = {
    isActive: true,
    totalRatings: { $gte: minRatings }
  };

  if (genre) {
    query.genre = genre;
  }

  return this.find(query)
    .sort({ avgRating: -1, totalRatings: -1 })
    .limit(limit);
};

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;