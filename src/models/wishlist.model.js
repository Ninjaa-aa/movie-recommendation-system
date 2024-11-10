// src/models/wishlist.model.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movies: [{
    movieId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  }]
}, {
  timestamps: true
});

// Ensure user can't add the same movie twice
wishlistSchema.index({ user: 1, 'movies.movieId': 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);