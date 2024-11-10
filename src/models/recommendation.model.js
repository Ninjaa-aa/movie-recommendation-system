// src/models/recommendation.model.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  type: {
    type: String,
    enum: ['similar', 'trending', 'personalized'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // Recommendations expire after 7 days
  }
});

recommendationSchema.index({ userId: 1, type: 1 });
recommendationSchema.index({ movieId: 1, type: 1 });
recommendationSchema.index({ score: -1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;
