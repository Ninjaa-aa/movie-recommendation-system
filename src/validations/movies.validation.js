// src/api/v1/movies/movies.validation.js
const Joi = require('joi');

const movieValidation = {
  createMovie: {
    body: Joi.object({
      title: Joi.string().required(),
      genre: Joi.array().items(Joi.string().valid(
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
        'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
        'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music',
        'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance',
        'Sci-Fi', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'
      )).min(1).required(),
      director: Joi.string().required(),
      cast: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          role: Joi.string().required(),
          order: Joi.number()
        })
      ).min(1).required(),
      releaseDate: Joi.date().required(),
      runtime: Joi.number().min(1).required(),
      synopsis: Joi.string().required(),
      language: Joi.string().valid(
        'English', 'Spanish', 'French', 'German', 'Italian',
        'Japanese', 'Korean', 'Chinese', 'Hindi', 'Other'
      ).required(),
      status: Joi.string().valid(
        'Released', 'Coming Soon', 'In Production'
      ).required(),
      production: Joi.object({
        company: Joi.string(),
        country: Joi.array().items(Joi.string().trim()),
        budget: Joi.object({
          amount: Joi.number().min(0),
          currency: Joi.string().default('USD')
        })
      }),
      certifications: Joi.array().items(
        Joi.object({
          region: Joi.string().required(),
          rating: Joi.string().required(),
          ratingReason: Joi.string()
        })
      ),
      keywords: Joi.array().items(Joi.string()),
      trivia: Joi.array().items(Joi.string()),
      goofs: Joi.array().items(Joi.string()),
      soundtrack: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          artist: Joi.string().required(),
          duration: Joi.string().required()
        })
      ),
      ageRating: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17').required()
    })
  },

  updateMovie: {
    params: Joi.object({
      movieId: Joi.string().required()
    }),
    body: Joi.object({
      title: Joi.string(),
      genre: Joi.array().items(Joi.string().valid(
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
        'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
        'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music',
        'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance',
        'Sci-Fi', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'
      )),
      director: Joi.string(),
      cast: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          role: Joi.string().required(),
          order: Joi.number()
        })
      ),
      releaseDate: Joi.date(),
      runtime: Joi.number().min(1),
      synopsis: Joi.string(),
      language: Joi.string().valid(
        'English', 'Spanish', 'French', 'German', 'Italian',
        'Japanese', 'Korean', 'Chinese', 'Hindi', 'Other'
      ),
      status: Joi.string().valid(
        'Released', 'Coming Soon', 'In Production'
      ),
      production: Joi.object({
        company: Joi.string(),
        country: Joi.array().items(Joi.string().trim()),
        budget: Joi.object({
          amount: Joi.number().min(0),
          currency: Joi.string()
        })
      }),
      certifications: Joi.array().items(
        Joi.object({
          region: Joi.string().required(),
          rating: Joi.string().required(),
          ratingReason: Joi.string()
        })
      ),
      keywords: Joi.array().items(Joi.string()),
      trivia: Joi.array().items(Joi.string()),
      goofs: Joi.array().items(Joi.string()),
      soundtrack: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          artist: Joi.string().required(),
          duration: Joi.string().required()
        })
      ),
      ageRating: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17')
    }).min(1)
  },

  getMovies: {
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      genre: Joi.string().valid(
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
        'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
        'Film-Noir', 'Game-Show', 'History', 'Horror', 'Music',
        'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance',
        'Sci-Fi', 'Sport', 'Talk-Show', 'Thriller', 'War', 'Western'
      ),
      language: Joi.string().valid(
        'English', 'Spanish', 'French', 'German', 'Italian',
        'Japanese', 'Korean', 'Chinese', 'Hindi', 'Other'
      ),
      status: Joi.string().valid(
        'Released', 'Coming Soon', 'In Production'
      ),
      search: Joi.string(),
      sortBy: Joi.string().valid(
        'title', 'releaseDate', 'runtime', 'avgRating', 
        'popularity', 'boxOfficeStats.totalWorldwide', 
        'awardStats.totalAwards'
      ),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      minRating: Joi.number().min(0).max(5),
      maxRating: Joi.number().min(0).max(5),
      releaseYear: Joi.number(),
      decade: Joi.number(),
      hasAwards: Joi.boolean(),
      country: Joi.string()
    })
  }
};

module.exports = movieValidation;