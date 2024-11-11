// src/models/movie.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  genre: [{ 
    type: String, 
    required: true,
    enum: [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
      'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
      'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music',
      'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance',
      'Sci-Fi', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'
    ]
  }],
  director: { 
    type: String, 
    required: true,
    index: true
  },
  cast: [{ 
    name: {
      type: String,
      index: true
    },
    role: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  releaseDate: { 
    type: Date, 
    required: true,
    index: true
  },
  releaseYear: {
    type: Number,
    index: true
  },
  decade: {
    type: Number,
    index: true
  },
  runtime: { 
    type: Number, 
    required: true 
  },
  synopsis: { 
    type: String, 
    required: true 
  },
  coverPhoto: { 
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  },
  language: {
    type: String,
    required: true,
    enum: [
      'English', 'Spanish', 'French', 'German', 'Italian',
      'Japanese', 'Korean', 'Chinese', 'Hindi', 'Other'
    ],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Released', 'Coming Soon', 'In Production'],
    index: true
  },
  // Rating related fields
  avgRating: { 
    type: Number, 
    default: 0,
    index: true
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Popularity metrics
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: null,
    index: true
  },
  // Box office references and stats
  boxOffice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoxOffice'
  },
  boxOfficeStats: {
    totalWorldwide: {
      type: Number,
      default: 0,
      index: true
    },
    openingWeekend: {
      type: Number,
      default: 0
    },
    budget: {
      type: Number,
      default: 0
    }
  },
  // Award references and stats
  awards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Award'
  }],
  awardStats: {
    totalAwards: {
      type: Number,
      default: 0,
      index: true
    },
    totalNominations: {
      type: Number,
      default: 0
    },
    majorAwards: {
      oscars: {
        wins: { type: Number, default: 0 },
        nominations: { type: Number, default: 0 }
      },
      goldenGlobes: {
        wins: { type: Number, default: 0 },
        nominations: { type: Number, default: 0 }
      },
      bafta: {
        wins: { type: Number, default: 0 },
        nominations: { type: Number, default: 0 }
      }
    }
  },
  // Production details
  production: {
    company: String,
    country: [{
      type: String,
      trim: true
    }],
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  // Additional metadata
  keywords: [{
    type: String,
    index: true
  }],
  trivia: [{ 
    type: String 
  }],
  goofs: [{ 
    type: String 
  }],
  soundtrack: [{
    title: String,
    artist: String,
    duration: String
  }],
  certifications: [{
    region: {
      type: String,
      required: true
    },
    rating: {
      type: String,
      required: true
    },
    ratingReason: String
  }],
  ageRating: { 
    type: String, 
    required: true,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
movieSchema.index({ isActive: 1, avgRating: -1 });
movieSchema.index({ isActive: 1, popularity: -1 });
movieSchema.index({ isActive: 1, releaseYear: -1 });
movieSchema.index({ isActive: 1, viewCount: -1 });
movieSchema.index({ isActive: 1, genre: 1 });
movieSchema.index({ isActive: 1, language: 1 });
movieSchema.index({ isActive: 1, decade: 1 });
movieSchema.index({ isActive: 1, lastViewedAt: -1 });
movieSchema.index({ 'boxOfficeStats.totalWorldwide': -1 });
movieSchema.index({ 'awardStats.totalAwards': -1 });
movieSchema.index({ 'production.country': 1 });

// Text search index
movieSchema.index({
  title: 'text',
  director: 'text',
  'cast.name': 'text',
  synopsis: 'text',
  keywords: 'text'
}, {
  weights: {
    title: 10,
    'cast.name': 5,
    director: 5,
    keywords: 3,
    synopsis: 1
  },
  name: "MovieTextIndex"
});

// Pre-save middleware
movieSchema.pre('save', function(next) {
  // Set release year and decade
  if (this.releaseDate) {
    this.releaseYear = this.releaseDate.getFullYear();
    this.decade = Math.floor(this.releaseYear / 10) * 10;
  }

  // Update popularity score
  if (this.isModified('viewCount') || 
      this.isModified('totalRatings') || 
      this.isModified('reviewCount') || 
      this.isModified('avgRating') ||
      this.isModified('boxOfficeStats.totalWorldwide')) {
    
    const viewWeight = 1;
    const ratingWeight = 2;
    const reviewWeight = 1.5;
    const avgRatingWeight = 3;
    const boxOfficeWeight = 2;
    
    const daysSinceRelease = this.releaseDate ? 
      Math.max(0, (Date.now() - this.releaseDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const timeDecay = Math.exp(-daysSinceRelease / 365);
    const boxOfficeScore = this.boxOfficeStats.totalWorldwide ? 
      Math.min(100, this.boxOfficeStats.totalWorldwide / 1000000000) * boxOfficeWeight : 0;
    
    this.popularity = (
      (this.viewCount * viewWeight +
       this.totalRatings * ratingWeight +
       this.reviewCount * reviewWeight +
       (this.avgRating * this.totalRatings) * avgRatingWeight +
       boxOfficeScore) *
      timeDecay
    );
  }

  next();
});

// Instance methods
movieSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

movieSchema.methods.updateAwardStats = async function() {
  const awards = await mongoose.model('Award').find({ 
    movie: this._id,
    isActive: true 
  });

  this.awardStats = {
    totalAwards: 0,
    totalNominations: 0,
    majorAwards: {
      oscars: { wins: 0, nominations: 0 },
      goldenGlobes: { wins: 0, nominations: 0 },
      bafta: { wins: 0, nominations: 0 }
    }
  };

  awards.forEach(award => {
    if (award.isNomination) {
      this.awardStats.totalNominations++;
      
      switch(award.organization.toLowerCase()) {
        case 'academy awards':
          award.isWinner ? 
            this.awardStats.majorAwards.oscars.wins++ : 
            this.awardStats.majorAwards.oscars.nominations++;
          break;
        case 'golden globes':
          award.isWinner ? 
            this.awardStats.majorAwards.goldenGlobes.wins++ : 
            this.awardStats.majorAwards.goldenGlobes.nominations++;
          break;
        case 'bafta':
          award.isWinner ? 
            this.awardStats.majorAwards.bafta.wins++ : 
            this.awardStats.majorAwards.bafta.nominations++;
          break;
      }
    }
    if (award.isWinner) {
      this.awardStats.totalAwards++;
    }
  });

  return this.save();
};

movieSchema.methods.updateBoxOfficeStats = async function() {
  const boxOffice = await mongoose.model('BoxOffice').findOne({ 
    movieId: this._id,
    isActive: true 
  });

  if (boxOffice) {
    this.boxOfficeStats = {
      totalWorldwide: boxOffice.totalEarnings?.worldwide?.amount || 0,
      openingWeekend: boxOffice.openingWeekend?.worldwide?.amount || 0,
      budget: boxOffice.budget?.production?.amount || 0
    };
    await this.save();
  }

  return this;
};

// Static methods
movieSchema.statics.getTrending = async function(options = {}) {
  const {
    period = 'week',
    limit = 10,
    genre = null
  } = options;

  const dateThreshold = new Date();
  switch(period) {
    case 'day':
      dateThreshold.setDate(dateThreshold.getDate() - 1);
      break;
    case 'week':
      dateThreshold.setDate(dateThreshold.getDate() - 7);
      break;
    case 'month':
      dateThreshold.setMonth(dateThreshold.getMonth() - 1);
      break;
  }

  const query = {
    isActive: true,
    lastViewedAt: { $gte: dateThreshold }
  };
  
  if (genre) {
    query.genre = genre;
  }

  return this.find(query)
    .sort({ popularity: -1 })
    .limit(limit);
};

movieSchema.statics.getTopRated = async function(options = {}) {
  const {
    minRatings = 10,
    limit = 10,
    genre = null
  } = options;

  const query = {
    isActive: true,
    totalRatings: { $gte: minRatings }
  };

  if (genre) {
    query.genre = genre;
  }

  return this.find(query)
    .sort({ avgRating: -1, totalRatings: -1 })
    .limit(limit);
};

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;