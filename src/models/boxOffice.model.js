// src/models/boxOffice.model.js
const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  }
});

const boxOfficeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    unique: true
  },
  openingWeekend: {
    domestic: earningsSchema,
    international: earningsSchema,
    worldwide: earningsSchema,
    date: {
      type: Date,
      required: true
    }
  },
  totalEarnings: {
    domestic: earningsSchema,
    international: earningsSchema,
    worldwide: earningsSchema,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  budget: {
    production: earningsSchema,
    marketing: earningsSchema
  },
  weeklyEarnings: [{
    week: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    domestic: earningsSchema,
    international: earningsSchema,
    worldwide: earningsSchema
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
boxOfficeSchema.index({ 'movieId': 1, 'isActive': 1 });
boxOfficeSchema.index({ 'totalEarnings.worldwide.amount': -1 });
boxOfficeSchema.index({ 'openingWeekend.worldwide.amount': -1 });

const BoxOffice = mongoose.model('BoxOffice', boxOfficeSchema);
module.exports = BoxOffice;