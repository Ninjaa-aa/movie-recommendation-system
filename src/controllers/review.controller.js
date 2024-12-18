const ReviewService = require('../services/review.service');
const { ApiResponse } = require('../utils/apiResponse');
const { catchAsync } = require('../utils/catchAsync');

class ReviewController {
  addReview = catchAsync(async (req, res) => {
    const { movieId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const newReview = await ReviewService.createReview(userId, movieId, content);
    
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Review added successfully',
      data: newReview
    });
  });

  updateReview = catchAsync(async (req, res) => {
    const { movieId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const updatedReview = await ReviewService.updateReview(userId, movieId, content);
    
    return ApiResponse.success(res, {
      message: 'Review updated successfully',
      data: updatedReview
    });
  });

  getMovieReviews = catchAsync(async (req, res) => {
    const { movieId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      highlighted = false 
    } = req.query;

    const reviews = await ReviewService.getMovieReviews(
      movieId,
      highlighted === 'true', // Convert string to boolean
      parseInt(page),
      parseInt(limit)
    );
    
    return ApiResponse.success(res, {
      message: 'Reviews retrieved successfully',
      data: reviews
    });
  });

  getHighlightedReviews = catchAsync(async (req, res) => {
    const { 
      page = 1, 
      limit = 10 
    } = req.query;

    const reviews = await ReviewService.getHighlightedReviews(
      parseInt(page),
      parseInt(limit)
    );
    
    return ApiResponse.success(res, {
      message: 'Highlighted reviews retrieved successfully',
      data: reviews
    });
  });
}

module.exports = new ReviewController();