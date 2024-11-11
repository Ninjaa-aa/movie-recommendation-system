// src/api/v1/boxOffice/boxOffice.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const boxOfficeService = require('./boxOffice.service');

const createBoxOffice = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const boxOffice = await boxOfficeService.createBoxOffice(movieId, req.body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Box office data created successfully',
    data: boxOffice
  });
});

const updateBoxOffice = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const boxOffice = await boxOfficeService.updateBoxOffice(movieId, req.body);

  return ApiResponse.success(res, {
    message: 'Box office data updated successfully',
    data: boxOffice
  });
});

const getBoxOfficeByMovie = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const boxOffice = await boxOfficeService.getBoxOfficeByMovie(movieId);

  return ApiResponse.success(res, {
    message: 'Box office data retrieved successfully',
    data: boxOffice
  });
});

const getTopGrossing = catchAsync(async (req, res) => {
  const { period = 'all-time', limit = 10 } = req.query;
  const boxOffice = await boxOfficeService.getTopGrossing(period, parseInt(limit));

  return ApiResponse.success(res, {
    message: 'Top grossing movies retrieved successfully',
    data: boxOffice
  });
});

const getWeeklyTrends = catchAsync(async (req, res) => {
  const trends = await boxOfficeService.getWeeklyTrends();

  return ApiResponse.success(res, {
    message: 'Weekly trends retrieved successfully',
    data: trends
  });
});

module.exports = {
  createBoxOffice,
  updateBoxOffice,
  getBoxOfficeByMovie,
  getTopGrossing,
  getWeeklyTrends
};