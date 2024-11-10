// src/api/v1/wishlist/wishlist.controller.js
const WishlistService = require('./wishlist.services');
const { ApiResponse } = require('../../../utils/apiResponse');

class WishlistController {
  constructor() {
    this.wishlistService = new WishlistService();
  }

  getWishlist = async (req, res, next) => {
    try {
      const wishlist = await this.wishlistService.getWishlist(req.user._id);
      return ApiResponse.success(res, {
        message: 'Wishlist retrieved successfully',
        data: { wishlist }
      });
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (req, res, next) => {
    try {
      const wishlist = await this.wishlistService.addToWishlist(req.user._id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Movie added to wishlist successfully',
        data: { wishlist }
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (req, res, next) => {
    try {
      await this.wishlistService.removeFromWishlist(req.user._id, req.params.movieId);
      return ApiResponse.success(res, {
        message: 'Movie removed from wishlist successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  updateMovieNotes = async (req, res, next) => {
    try {
      const wishlist = await this.wishlistService.updateMovieNotes(
        req.user._id,
        req.params.movieId,
        req.body
      );
      return ApiResponse.success(res, {
        message: 'Movie notes updated successfully',
        data: { wishlist }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WishlistController();