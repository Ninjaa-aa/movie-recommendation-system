// src/models/forum.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Forum name is required'],
    trim: true,
    minlength: [3, 'Forum name must be at least 3 characters long'],
    maxlength: [100, 'Forum name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Forum description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Forum category is required'],
    enum: ['MOVIES', 'TV_SHOWS', 'GENERAL', 'NEWS', 'REVIEWS'],
    uppercase: true
  },
  movie: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: false
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  topicCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
forumSchema.index({ slug: 1 }, { unique: true });
forumSchema.index({ category: 1 });
forumSchema.index({ movie: 1 });
forumSchema.index({ isActive: 1 });
forumSchema.index({ name: 'text', description: 'text' });

// Update counts middleware
forumSchema.methods.updateCounts = async function() {
  const topicCount = await mongoose.model('Topic').countDocuments({
    forum: this._id,
    isActive: true
  });
  
  const postCount = await mongoose.model('Post').countDocuments({
    topic: { 
      $in: await mongoose.model('Topic')
        .find({ forum: this._id, isActive: true })
        .distinct('_id')
    },
    isActive: true
  });

  this.topicCount = topicCount;
  this.postCount = postCount;
  await this.save();
};

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;