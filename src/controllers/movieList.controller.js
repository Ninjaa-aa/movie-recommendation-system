const MovieListService = require('../services/movieList.service');
const { ApiResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

class MovieListController {
  constructor() {
    this.movieListService = new MovieListService();
  }

  createList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.createList(req.user.id, req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Movie list created successfully',
      data: { list }
    });
  });

  getUserLists = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const { page = 1, limit = 10 } = req.query;
    
    const result = await this.movieListService.getUserLists(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return ApiResponse.success(res, {
      message: 'User lists retrieved successfully',
      data: result
    });
  });

  getPublicLists = catchAsync(async (req, res) => {
    const result = await this.movieListService.getPublicLists(req.query);
    return ApiResponse.success(res, {
      message: 'Public lists retrieved successfully',
      data: result
    });
  });

  getListById = catchAsync(async (req, res) => {
    const userId = req.user?.id || null; // Make userId optional for public lists
    const list = await this.movieListService.getListById(req.params.listId, userId);
    return ApiResponse.success(res, {
      message: 'List retrieved successfully',
      data: { list }
    });
  });

  addMovieToList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.addMovieToList(
      req.params.listId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, {
      message: 'Movie added to list successfully',
      data: { list }
    });
  });

  removeMovieFromList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.removeMovieFromList(
      req.params.listId,
      req.user.id,
      req.params.movieId
    );
    return ApiResponse.success(res, {
      message: 'Movie removed from list successfully',
      data: { list }
    });
  });

  followList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.followList(req.params.listId, req.user.id);
    return ApiResponse.success(res, {
      message: 'List followed successfully',
      data: { list }
    });
  });

  unfollowList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.unfollowList(req.params.listId, req.user.id);
    return ApiResponse.success(res, {
      message: 'List unfollowed successfully',
      data: { list }
    });
  });

  updateList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const list = await this.movieListService.updateList(
      req.params.listId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, {
      message: 'List updated successfully',
      data: { list }
    });
  });

  deleteList = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    await this.movieListService.deleteList(req.params.listId, req.user.id);
    return ApiResponse.success(res, {
      message: 'List deleted successfully'
    });
  });
}

module.exports = new MovieListController();