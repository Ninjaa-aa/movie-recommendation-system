// src/models/reminder.model.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['release', 'trailer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'cancelled'],
    default: 'pending'
  },
  reminderDate: {
    type: Date,
    required: true
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'dashboard']
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
reminderSchema.index({ userId: 1, movieId: 1, type: 1 });
reminderSchema.index({ status: 1, reminderDate: 1 });
reminderSchema.index({ userId: 1, status: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;