// scripts/seedRatings.js
const mongoose = require('mongoose');
const Rating = require('../models/rating.model');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
require('dotenv').config();

async function seedRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a user
    const user = await User.findOne(); // Get first user or specify user ID
    if (!user) {
      console.log('No user found. Please create a user first.');
      process.exit(1);
    }

    // Get some movies
    const movies = await Movie.find({ isActive: true }).limit(5);
    if (movies.length === 0) {
      console.log('No movies found. Please add movies first.');
      process.exit(1);
    }

    // Create ratings
    const ratings = movies.map(movie => ({
      userId: user._id,
      movieId: movie._id,
      rating: Math.floor(Math.random() * 4) + 2 // Random rating between 2-5
    }));

    // Delete existing ratings for this user
    await Rating.deleteMany({ userId: user._id });

    // Insert new ratings
    await Rating.insertMany(ratings);

    console.log(`Created ${ratings.length} ratings for user ${user._id}`);
    
    // Update movie average ratings
    for (const movie of movies) {
      const movieRatings = await Rating.find({ movieId: movie._id });
      const avgRating = movieRatings.reduce((acc, curr) => acc + curr.rating, 0) / movieRatings.length;
      
      await Movie.findByIdAndUpdate(movie._id, {
        avgRating: Number(avgRating.toFixed(1))
      });
    }

    console.log('Ratings seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding ratings:', error);
    process.exit(1);
  }
}

seedRatings();