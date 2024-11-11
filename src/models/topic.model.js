// src/models/topic.model.js
const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 10000
  },
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  totalReplies: {
    type: Number,
    default: 0
  },
  lastReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  timestamps: true
});

// Indexes
topicSchema.index({ forum: 1, createdAt: -1 });
topicSchema.index({ slug: 1 });
topicSchema.index({ author: 1 });
topicSchema.index({ tags: 1 });
topicSchema.index({ title: 'text', content: 'text' });

const Topic = mongoose.model('Topic', topicSchema);