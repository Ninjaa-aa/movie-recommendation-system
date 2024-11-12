// src/controllers/admin.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const adminService = require('../services/admin.service');

exports.getMovieModeration = catchAsync(async (req, res) => {
  const moderationData = await adminService.getMovieModeration();
  return ApiResponse.success(res, {
    message: 'Movie moderation data retrieved successfully',
    data: moderationData
  });
});

exports.moderateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { action, reason } = req.body;
  const result = await adminService.moderateReview(reviewId, action, reason);
  return ApiResponse.success(res, {
    message: 'Review moderated successfully',
    data: result
  });
});

exports.getSiteStatistics = catchAsync(async (req, res) => {
  const { timeframe } = req.query;
  const statistics = await adminService.getSiteStatistics(timeframe);
  return ApiResponse.success(res, {
    message: 'Site statistics retrieved successfully',
    data: statistics
  });
});