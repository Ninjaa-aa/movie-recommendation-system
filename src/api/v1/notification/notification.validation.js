// src/api/v1/notifications/notification.validation.js
const Joi = require('joi');

const getUserNotifications = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

const markAsRead = {
  params: Joi.object({
    notificationId: Joi.string().required()
  })
};

const deleteNotification = {
  params: Joi.object({
    notificationId: Joi.string().required()
  })
};

module.exports = {
  getUserNotifications,
  markAsRead,
  deleteNotification
};