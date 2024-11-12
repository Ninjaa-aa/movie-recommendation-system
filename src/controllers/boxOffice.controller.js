// src/api/v1/box-office/boxOffice.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const boxOfficeService = require('../services/boxOffice.service');

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

const getBoxOffice = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const boxOffice = await boxOfficeService.getBoxOffice(movieId);

  return ApiResponse.success(res, {
    message: 'Box office data retrieved successfully',
    data: boxOffice
  });
});

const getTopGrossing = catchAsync(async (req, res) => {
  const { period, limit } = req.query;
  const boxOfficeData = await boxOfficeService.getTopGrossing(period, parseInt(limit));

  return ApiResponse.success(res, {
    message: 'Top grossing movies retrieved successfully',
    data: boxOfficeData
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
  getBoxOffice,
  getTopGrossing,
  getWeeklyTrends
};