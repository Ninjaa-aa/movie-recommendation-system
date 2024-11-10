// models/movie.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  genre: [{ 
    type: String, 
    required: true 
  }],
  director: { 
    type: String, 
    required: true 
  },
  cast: [{ 
    name: String, 
    role: String 
  }],
  releaseDate: { 
    type: Date, 
    required: true 
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
    type: String, 
    required: true 
  },
  avgRating: { 
    type: Number, 
    default: 0 
  },
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
  ageRating: { 
    type: String, 
    required: true,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);