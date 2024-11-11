// src/models/award.model.js
const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  organization: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  ceremony: {
    type: String,
    required: true,
    trim: true
  },
  isNomination: {
    type: Boolean,
    default: true,
    index: true
  },
  isWinner: {
    type: Boolean,
    default: false,
    index: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true
  },
  recipients: [{
    name: {
      type: String,
      required: true,
      index: true
    },
    role: {
      type: String,
      required: true
    }
  }],
  description: {
    type: String,
    trim: true
  },
  imageUrl: String,
  sourceUrl: String,
  presentedBy: String,
  acceptedBy: String,
  ceremonyDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes
awardSchema.index({ organization: 1, year: -1 });
awardSchema.index({ movie: 1, isWinner: 1 });
awardSchema.index({ isWinner: 1, year: -1 });
awardSchema.index({ 'recipients.name': 1, organization: 1 });
awardSchema.index({ category: 1, year: -1 });

// Pre-save middleware to update movie stats
awardSchema.pre('save', async function(next) {
  try {
    const movie = await this.model('Movie').findById(this.movie);
    if (movie) {
      await movie.updateAwardStats();
    }
  } catch (error) {
    console.error('Error updating movie award stats:', error);
  }
  next();
});

// Pre-remove middleware to update movie stats
awardSchema.pre('remove', async function(next) {
  try {
    const movie = await this.model('Movie').findById(this.movie);
    if (movie) {
      await movie.updateAwardStats();
    }
  } catch (error) {
    console.error('Error updating movie award stats:', error);
  }
  next();
});

const Award = mongoose.model('Award', awardSchema);
module.exports = Award;