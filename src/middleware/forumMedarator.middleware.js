// src/middlewares/forumModerator.js
const { Forum } = require('../models/community.models');
const ApiError = require('../utils/ApiError');

const checkForumModerator = async (req, res, next) => {
  try {
    const { forumId } = req.params;
    const userId = req.user.id;

    const forum = await Forum.findById(forumId);
    if (!forum) {
      throw new ApiError(404, 'Forum not found');
    }

    const isModerator = forum.moderators.includes(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isModerator && !isAdmin) {
      throw new ApiError(403, 'You must be a moderator to perform this action');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkForumModerator
};
