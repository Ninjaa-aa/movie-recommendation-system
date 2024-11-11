// src/api/v1/admin/admin.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const { analyticsService, moderationService } = require('./admin.service');

// Analytics Controllers
const getOverallStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const stats = await analyticsService.getOverallStats(period);
  
  return ApiResponse.success(res, {
    message: 'Analytics retrieved successfully',
    data: stats
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const dateFilter = analyticsService.getDateFilter(period);
  const stats = await analyticsService.getUserStats(dateFilter);
  
  return ApiResponse.success(res, {
    message: 'User statistics retrieved successfully',
    data: stats
  });
});

const getMovieStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const dateFilter = analyticsService.getDateFilter(period);
  const stats = await analyticsService.getMovieStats(dateFilter);
  
  return ApiResponse.success(res, {
    message: 'Movie statistics retrieved successfully',
    data: stats
  });
});

const getEngagementStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const dateFilter = analyticsService.getDateFilter(period);
  const stats = await analyticsService.getEngagementStats(dateFilter);
  
  return ApiResponse.success(res, {
    message: 'Engagement statistics retrieved successfully',
    data: stats
  });
});

const getGenreStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const dateFilter = analyticsService.getDateFilter(period);
  const stats = await analyticsService.getGenreStats(dateFilter);
  
  return ApiResponse.success(res, {
    message: 'Genre statistics retrieved successfully',
    data: stats
  });
});

const getActorStats = catchAsync(async (req, res) => {
  const { period } = req.query;
  const dateFilter = analyticsService.getDateFilter(period);
  const stats = await analyticsService.getActorStats(dateFilter);
  
  return ApiResponse.success(res, {
    message: 'Actor statistics retrieved successfully',
    data: stats
  });
});

// Moderation Controllers
const getModerationQueue = catchAsync(async (req, res) => {
  const { type, status, moderator, page, limit } = req.query;
  const queue = await moderationService.getModrationQueue(
    { type, status, moderator },
    page,
    limit
  );
  
  return ApiResponse.success(res, {
    message: 'Moderation queue retrieved successfully',
    data: queue
  });
});

const moderateContent = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { decision, notes } = req.body;
  const result = await moderationService.moderateContent(
    itemId,
    req.user.id,
    decision,
    notes
  );
  
  return ApiResponse.success(res, {
    message: 'Content moderated successfully',
    data: result
  });
});

module.exports = {
  getOverallStats,
  getUserStats,
  getMovieStats,
  getEngagementStats,
  getGenreStats,
  getActorStats,
  getModerationQueue,
  moderateContent
};