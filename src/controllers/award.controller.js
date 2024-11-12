// src/api/v1/awards/award.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const awardService = require('../services/award.service');

const createAward = catchAsync(async (req, res) => {
  const award = await awardService.createAward(req.body);
  
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Award created successfully',
    data: award
  });
});

const updateAward = catchAsync(async (req, res) => {
  const { awardId } = req.params;
  const award = await awardService.updateAward(awardId, req.body);
  return ApiResponse.success(res, {
    message: 'Award updated successfully',
    data: award
  });
});

const getMovieAwards = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const awards = await awardService.getMovieAwards(movieId, req.query);
  return ApiResponse.success(res, {
    message: 'Movie awards retrieved successfully',
    data: awards
  });
});

const getAwardsByYear = catchAsync(async (req, res) => {
  const { year, organization } = req.query;
  const awards = await awardService.getAwardsByYear(parseInt(year), organization);
  return ApiResponse.success(res, {
    message: 'Awards retrieved successfully',
    data: awards
  });
});

const getAwardWinners = catchAsync(async (req, res) => {
  const { organization, year } = req.query;
  const winners = await awardService.getAwardWinners(organization, parseInt(year));
  return ApiResponse.success(res, {
    message: 'Award winners retrieved successfully',
    data: winners
  });
});

const searchAwards = catchAsync(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const awards = await awardService.searchAwards(
    filters,
    parseInt(page) || 1,
    parseInt(limit) || 10
  );
  return ApiResponse.success(res, {
    message: 'Awards retrieved successfully',
    data: awards
  });
});

const deleteAward = catchAsync(async (req, res) => {
  const { awardId } = req.params;
  const result = await awardService.deleteAward(awardId);
  return ApiResponse.success(res, {
    message: result.message
  });
});

const getMajorAwardStats = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const stats = await awardService.getMajorAwardStats(movieId);
  return ApiResponse.success(res, {
    message: 'Major award statistics retrieved successfully',
    data: stats
  });
});

module.exports = {
  createAward,
  updateAward,
  getMovieAwards,
  getAwardsByYear,
  getAwardWinners,
  searchAwards,
  deleteAward,
  getMajorAwardStats
};  