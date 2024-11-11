// src/api/v1/awards/award.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const awardService = require('./award.service');

const createAward = async (req, res) => {
  try {
    logger.debug('Creating award', req.body);
    
    const award = await awardService.createAward(req.body);
    logger.debug('Award created', award);
    
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Award created successfully',
      data: award
    });
  } catch (error) {
    logger.error('Error creating award', error);
    return ApiResponse.error(res, {
      statusCode: error.statusCode || 500,
      message: error.message || 'Error creating award',
      error: error
    });
  }
};

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
  const awards = await awardService.getMovieAwards(movieId);

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
  const awards = await awardService.searchAwards(req.query);

  return ApiResponse.success(res, {
    message: 'Awards retrieved successfully',
    data: awards
  });
});

module.exports = {
  createAward,
  updateAward,
  getMovieAwards,
  getAwardsByYear,
  getAwardWinners,
  searchAwards
};