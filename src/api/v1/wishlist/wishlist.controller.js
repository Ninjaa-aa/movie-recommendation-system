// src/api/v1/wishlist/wishlist.controller.js
const WishlistService = require('./wishlist.services');
const { ApiResponse } = require('../../../utils/apiResponse');
const { catchAsync } = require('../../../utils/catchAsync');

class WishlistController {
  constructor() {
    this.wishlistService = new WishlistService();
  }

  getWishlist = catchAsync(async (req, res) => {
    const wishlist = await this.wishlistService.getWishlist(req.user._id);
    return ApiResponse.success(res, {
      message: 'Wishlist retrieved successfully',
      data: { wishlist }
    });
  });

  getAvailableMovies = catchAsync(async (req, res) => {
    const movies = await this.wishlistService.getAvailableMovies(req.user._id);
    return ApiResponse.success(res, {
      message: 'Available movies retrieved successfully',
      data: { movies }
    });
  });

  addToWishlist = catchAsync(async (req, res) => {
    const wishlist = await this.wishlistService.addToWishlist(req.user._id, req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Movie added to wishlist successfully',
      data: { wishlist }
    });
  });

  removeFromWishlist = catchAsync(async (req, res) => {
    const wishlist = await this.wishlistService.removeFromWishlist(req.user._id, req.params.movieId);
    return ApiResponse.success(res, {
      message: 'Movie removed from wishlist successfully',
      data: { wishlist }
    });
  });

  updateMovieNotes = catchAsync(async (req, res) => {
    const wishlist = await this.wishlistService.updateMovieNotes(
      req.user._id,
      req.params.movieId,
      req.body
    );
    return ApiResponse.success(res, {
      message: 'Movie notes updated successfully',
      data: { wishlist }
    });
  });
}

module.exports = new WishlistController();