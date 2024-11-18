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
    default: 0
  },
  // Action counts
  viewCount: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  
  // Time-based metrics
  hourlyDistribution: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  
  // Demographic metrics (optional)
  ageGroups: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  genderDistribution: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  
  // Geographic metrics (optional)
  regionDistribution: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  
  // Rating distribution
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // Period tracking
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Additional metrics
  averageRating: {
    type: Number,
    default: 0
  },
  uniqueViewers: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  
  // Engagement metrics
  engagementScore: {
    type: Number,
    default: 0
  },
  
  // Momentum tracking
  scoreChange: {
    type: Number,
    default: 0
  },
  trend: {
    type: String,
    enum: ['rising', 'falling', 'stable'],
    default: 'stable'
  }
}, {
  timestamps: true,
  
  toJSON: {
    transform: function(doc, ret) {
      // Format dates
      ret.date = ret.date.toISOString();
      ret.createdAt = ret.createdAt.toISOString();
      ret.updatedAt = ret.updatedAt.toISOString();
      
      // Calculate percentages
      if (ret.ratingCount > 0) {
        ret.ratingPercentages = {};
        for (let i = 1; i <= 5; i++) {
          ret.ratingPercentages[i] = (ret.ratingDistribution[i] / ret.ratingCount) * 100;
        }
      }
      
      // Add trending status
      ret.trendingStatus = getTrendingStatus(ret);
      
      return ret;
    }
  }
});

// Indexes for efficient querying
trendingSchema.index({ period: 1, date: -1, score: -1 });
trendingSchema.index({ movieId: 1, period: 1, date: -1 });
trendingSchema.index({ trend: 1, score: -1 });
trendingSchema.index({ engagementScore: -1 });
trendingSchema.index({ 'regionDistribution.country': 1 });
trendingSchema.index({ updatedAt: -1 });

// Virtual for trending velocity
trendingSchema.virtual('velocity').get(function() {
  const hoursSinceUpdate = (Date.now() - this.updatedAt) / (1000 * 60 * 60);
  return this.scoreChange / Math.max(hoursSinceUpdate, 1);
});

// Methods
trendingSchema.methods = {
  // Update engagement score based on various metrics
  updateEngagementScore: function() {
    const weights = {
      view: 1,
      rating: 5,
      favorite: 3,
      share: 4,
      comment: 2
    };

    this.engagementScore = 
      (this.viewCount * weights.view) +
      (this.ratingCount * weights.rating) +
      (this.favoriteCount * weights.favorite) +
      (this.shareCount * weights.share) +
      (this.commentCount * weights.comment);

    return this.engagementScore;
  },

  // Track score changes and update trend
  updateTrend: function(previousScore) {
    this.scoreChange = this.score - (previousScore || 0);
    if (this.scoreChange > 0) this.trend = 'rising';
    else if (this.scoreChange < 0) this.trend = 'falling';
    else this.trend = 'stable';
  }
};

// Statics
trendingSchema.statics = {
  // Get trending movies with advanced filtering
  async getTrending(options = {}) {
    const {
      period = 'daily',
      limit = 10,
      minScore = 0,
      trend,
      region,
      timeRange
    } = options;

    const query = {
      period,
      score: { $gt: minScore }
    };

    if (trend) query.trend = trend;
    if (region) query['regionDistribution.country'] = region;
    if (timeRange) {
      query.date = {
        $gte: new Date(timeRange.start),
        $lte: new Date(timeRange.end)
      };
    }

    return this.find(query)
      .sort({ score: -1 })
      .limit(limit)
      .populate('movieId');
  },

  // Get trending insights
  async getTrendingInsights(movieId, period = 'daily') {
    const trends = await this.find({ 
      movieId,
      period
    })
    .sort({ date: -1 })
    .limit(30);

    return {
      trendData: trends.map(t => ({
        date: t.date,
        score: t.score,
        engagement: t.engagementScore
      })),
      averageEngagement: trends.reduce((acc, t) => acc + t.engagementScore, 0) / trends.length,
      dominantTrend: calculateDominantTrend(trends)
    };
  }
};

// Middleware
trendingSchema.pre('save', async function(next) {
  if (this.isModified('score')) {
    const previous = await this.constructor.findOne({ 
      movieId: this.movieId,
      period: this.period,
      date: { $lt: this.date }
    });
    this.updateTrend(previous?.score);
  }
  this.updateEngagementScore();
  next();
});

// Helper functions
function getTrendingStatus(doc) {
  const score = doc.score;
  if (score > 1000) return 'viral';
  if (score > 500) return 'trending';
  if (score > 100) return 'rising';
  return 'normal';
}

function calculateDominantTrend(trends) {
  const changes = trends
    .map(t => t.scoreChange)
    .reduce((acc, change) => {
      if (change > 0) acc.rising++;
      else if (change < 0) acc.falling++;
      else acc.stable++;
      return acc;
    }, { rising: 0, falling: 0, stable: 0 });

  return Object.entries(changes)
    .sort(([,a], [,b]) => b - a)[0][0];
}

const Trending = mongoose.model('Trending', trendingSchema);
module.exports = Trending;