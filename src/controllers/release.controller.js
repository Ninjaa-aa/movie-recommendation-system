// src/api/v1/release/release.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const releaseService = require('../services/release.service');

const getUpcomingReleases = catchAsync(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const releases = await releaseService.getUpcomingReleases(filters, page, limit);

  return ApiResponse.success(res, {
    message: 'Upcoming releases retrieved successfully',
    data: releases
  });
});

const setReminder = catchAsync(async (req, res) => {
  const { movieId, type } = req.body;
  const userId = req.user.id;

  const result = await releaseService.setReminder(userId, movieId, type);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: result.message,
    data: {
      reminder: result.reminder,
      notification: result.notification
    }
  });
});

const getUserReminders = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const reminders = await releaseService.getUserReminders(userId, page, limit);

  return ApiResponse.success(res, {
    message: 'Reminders retrieved successfully',
    data: reminders
  });
});

const cancelReminder = catchAsync(async (req, res) => {
  const { movieId, type } = req.params;
  const userId = req.user.id;

  const result = await releaseService.cancelReminder(userId, movieId, type);

  return ApiResponse.success(res, {
    message: result.message,
    data: result.reminder
  });
});

module.exports = {
  getUpcomingReleases,
  setReminder,
  getUserReminders,
  cancelReminder
};