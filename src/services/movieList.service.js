const mongoose = require('mongoose');
const MovieList = require('../models/movieList.model');
const Movie = require('../models/movie.model');
const ApiError = require('../utils/ApiError'); // Fixed import

class MovieListService {
  async createList(userId, { title, description, isPublic, tags }) {
    const existingList = await MovieList.findOne({ user: userId, title });
    if (existingList) {
      throw new ApiError(400, 'A list with this title already exists');
    }

    const movieList = await MovieList.create({
      user: userId,
      title,
      description,
      isPublic,
      tags,
      movies: []
    });

    return movieList;
  }

  async getUserLists(userId, { page = 1, limit = 10 }) {
    const lists = await MovieList.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('movies.movie', 'title genre releaseDate coverPhoto');

    const total = await MovieList.countDocuments({ user: userId });

    return {
      lists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPublicLists({ page = 1, limit = 10, tags }) {
    const query = { isPublic: true };
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const lists = await MovieList.find(query)
      .sort({ 'followers.length': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username')
      .populate('movies.movie', 'title genre releaseDate coverPhoto');

    const total = await MovieList.countDocuments(query);

    return {
      lists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getListById(listId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(listId)) {
        throw new ApiError(400, 'Invalid list ID format');
      }

      const list = await MovieList.findById(listId)
        .populate({
          path: 'user',
          select: 'username email'
        })
        .populate({
          path: 'movies.movie',
          select: 'title genre releaseDate coverPhoto',
          match: { isActive: true }
        })
        .populate({
          path: 'followers.user',
          select: 'username'
        })
        .lean();

      if (!list) {
        throw new ApiError(404, 'List not found');
      }

      if (!list.isPublic && (!userId || list.user._id.toString() !== userId.toString())) {
        throw new ApiError(403, 'Access denied to private list');
      }

      list.movies = list.movies.filter(movie => movie.movie != null);

      return {
        ...list,
        isOwner: userId ? list.user._id.toString() === userId.toString() : false,
        followersCount: list.followers.length,
        moviesCount: list.movies.length,
        isFollowing: userId ? list.followers.some(f => f.user._id.toString() === userId.toString()) : false
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid list ID format');
      }
      if (error instanceof ApiError) throw error;
      console.error('GetListById Error:', error);
      throw new ApiError(500, 'Error retrieving movie list');
    }
  }

  async checkListOwnership(listId, userId) {
    const list = await MovieList.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new ApiError(404, 'List not found or unauthorized');
    }
    return list;
  }

  async validateMovie(movieId) {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new ApiError(400, 'Invalid movie ID format');
    }

    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      throw new ApiError(404, 'Movie not found or inactive');
    }
    return movie;
  }

  async addMovieToList(listId, userId, { movieId, notes }) {
    try {
      const list = await this.checkListOwnership(listId, userId);
      await this.validateMovie(movieId);

      const movieExists = list.movies.some(m => m.movie.toString() === movieId);
      if (movieExists) {
        throw new ApiError(400, 'Movie already in list');
      }

      list.movies.push({ movie: movieId, notes });
      await list.save();

      return await list.populate('movies.movie', 'title genre releaseDate coverPhoto');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('AddMovieToList Error:', error);
      throw new ApiError(500, 'Error adding movie to list');
    }
  }

  async removeMovieFromList(listId, userId, movieId) {
    try {
      const list = await this.checkListOwnership(listId, userId);

      const movieIndex = list.movies.findIndex(m => m.movie.toString() === movieId);
      if (movieIndex === -1) {
        throw new ApiError(404, 'Movie not found in list');
      }

      list.movies.splice(movieIndex, 1);
      await list.save();

      return await list.populate('movies.movie', 'title genre releaseDate coverPhoto');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('RemoveMovieFromList Error:', error);
      throw new ApiError(500, 'Error removing movie from list');
    }
  }

  async followList(listId, userId) {
    const list = await MovieList.findById(listId);
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    if (!list.isPublic) {
      throw new ApiError(403, 'Cannot follow private list');
    }

    const alreadyFollowing = list.followers.some(f => f.user.toString() === userId);
    if (alreadyFollowing) {
      throw new ApiError(400, 'Already following this list');
    }

    list.followers.push({ user: userId });
    await list.save();

    return list;
  }

  async unfollowList(listId, userId) {
    const list = await MovieList.findById(listId);
    if (!list) {
      throw new ApiError(404, 'List not found');
    }

    const followerIndex = list.followers.findIndex(f => f.user.toString() === userId);
    if (followerIndex === -1) {
      throw new ApiError(400, 'Not following this list');
    }

    list.followers.splice(followerIndex, 1);
    await list.save();

    return list;
  }

  async updateList(listId, userId, updates) {
    const list = await MovieList.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new ApiError(404, 'List not found or unauthorized');
    }

    if (updates.title && updates.title !== list.title) {
      const existingList = await MovieList.findOne({
        user: userId,
        title: updates.title,
        _id: { $ne: listId }
      });
      if (existingList) {
        throw new ApiError(400, 'A list with this title already exists');
      }
    }

    Object.assign(list, updates);
    await list.save();

    return list;
  }

  async deleteList(listId, userId) {
    const list = await MovieList.findOneAndDelete({ _id: listId, user: userId });
    if (!list) {
      throw new ApiError(404, 'List not found or unauthorized');
    }
    return list;
  }
}

module.exports = MovieListService;