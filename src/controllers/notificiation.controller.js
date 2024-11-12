// src/api/v1/notifications/notification.controller.js
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');

const getUserNotifications = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const userId = req.user.id;
  const notifications = await notificationService.getUserNotifications(userId, page, limit);

  return ApiResponse.success(res, {
    message: 'Notifications retrieved successfully',
    data: notifications
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;
  const notification = await notificationService.markAsRead(userId, notificationId);

  return ApiResponse.success(res, {
    message: 'Notification marked as read',
    data: notification
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await notificationService.markAllAsRead(userId);

  return ApiResponse.success(res, {
    message: result.message
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;
  const result = await notificationService.deleteNotification(userId, notificationId);

  return ApiResponse.success(res, {
    message: result.message
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await notificationService.getUnreadCount(userId);

  return ApiResponse.success(res, {
    message: 'Unread count retrieved successfully',
    data: result
  });
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};