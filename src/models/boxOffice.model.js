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
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
    default: 'USD'
  }
}, { _id: false });

const weeklyEarningsSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  domestic: {
    type: earningsSchema,
    required: true
  },
  international: {
    type: earningsSchema,
    required: true
  },
  worldwide: {
    type: earningsSchema,
    required: true
  }
}, { _id: false });

const boxOfficeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true
  },
  openingWeekend: {
    domestic: {
      type: earningsSchema,
      required: true
    },
    international: {
      type: earningsSchema,
      required: true
    },
    worldwide: {
      type: earningsSchema,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  totalEarnings: {
    domestic: earningsSchema,
    international: earningsSchema,
    worldwide: earningsSchema
  },
  budget: {
    production: earningsSchema,
    marketing: earningsSchema
  },
  weeklyEarnings: [weeklyEarningsSchema]
}, {
  timestamps: true
});

// Indexes
boxOfficeSchema.index({ 'openingWeekend.worldwide.amount': -1 });
boxOfficeSchema.index({ 'totalEarnings.worldwide.amount': -1 });
boxOfficeSchema.index({ 'openingWeekend.date': -1 });

const BoxOffice = mongoose.model('BoxOffice', boxOfficeSchema);
module.exports = BoxOffice;