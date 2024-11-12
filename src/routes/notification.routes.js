// src/api/v1/notifications/notification.routes.js
const express = require('express');
const { isAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const notificationValidation = require('../validations/notification.validation');
const notificationController = require('../controllers/notificiation.controller');

const router = express.Router();

router.get(
  '/',
  isAuth,
  validate(notificationValidation.getUserNotifications),
  notificationController.getUserNotifications
);

router.get(
  '/unread-count',
  isAuth,
  notificationController.getUnreadCount
);

router.patch(
  '/:notificationId/read',
  isAuth,
  validate(notificationValidation.markAsRead),
  notificationController.markAsRead
);

router.patch(
  '/mark-all-read',
  isAuth,
  notificationController.markAllAsRead
);

router.delete(
  '/:notificationId',
  isAuth,
  validate(notificationValidation.deleteNotification),
  notificationController.deleteNotification
);

module.exports = router;