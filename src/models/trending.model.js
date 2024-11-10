// src/models/trending.model.js
const mongoose = require('mongoose');

const trendingSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

trendingSchema.index({ period: 1, date: -1, score: -1 });

const Trending = mongoose.model('Trending', trendingSchema);
module.exports = Trending;