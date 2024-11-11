const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index for userId and movieId to ensure unique reviews
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Create indexes for common queries
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ isHighlighted: 1, likes: -1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;