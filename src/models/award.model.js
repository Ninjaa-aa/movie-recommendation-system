// src/models/award.model.js
const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true,
    index: true
  },
  role: {
    type: String,
    required: [true, 'Recipient role is required'],
    trim: true
  }
});

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Award name is required'],
    trim: true,
    index: true
  },
  organization: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Award category is required'],
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    index: true
  },
  ceremony: {
    type: String,
    required: [true, 'Ceremony name is required'],
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
    index: true
  },
  recipients: {
    type: [recipientSchema],
    required: [true, 'At least one recipient is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one recipient is required'
    }
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  },
  sourceUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Source URL must be a valid URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
awardSchema.index({ organization: 1, year: -1 });
awardSchema.index({ isWinner: 1, year: -1 });
awardSchema.index({ movie: 1, year: -1 });
awardSchema.index({ 'recipients.name': 1 });
awardSchema.index({ isActive: 1, year: -1 });

// Text search index
awardSchema.index({
  name: 'text',
  organization: 'text',
  category: 'text',
  'recipients.name': 'text',
  description: 'text'
}, {
  weights: {
    name: 10,
    organization: 5,
    category: 5,
    'recipients.name': 3,
    description: 1
  },
  name: "AwardTextIndex"
});

const Award = mongoose.model('Award', awardSchema);
module.exports = Award;
