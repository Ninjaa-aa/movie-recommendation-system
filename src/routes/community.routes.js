// src/routes/community.routes.js
const express = require('express');
const { validate } = require('../middleware/validation.middleware');
const { isAuth } = require('../middleware/auth.middleware');
const communityValidation = require('../validations/community.validation');
const communityController = require('../controllers/community.controller');
const { checkForumModerator } = require('../middleware/forumModerator.middleware');

const router = express.Router();

// Forum Routes
router.route('/forums')
  .post(
    isAuth,
    validate(communityValidation.createForum),
    communityController.createForum
  )
  .get(
    validate(communityValidation.listForums),
    communityController.listForums
  );

router.route('/forums/:forumId')
  .get(
    validate(communityValidation.getForum),
    communityController.getForum
  )
  .patch(
    isAuth,
    checkForumModerator,
    validate(communityValidation.updateForum),
    communityController.updateForum
  )
  .delete(
    isAuth,
    checkForumModerator,
    validate(communityValidation.deleteForum),
    communityController.deleteForum
  );

// Topic Routes
router.route('/forums/:forumId/topics')
  .post(
    isAuth,
    validate(communityValidation.createTopic),
    communityController.createTopic
  )
  .get(
    validate(communityValidation.listTopics),
    communityController.listTopics
  );

router.route('/topics/:topicId')
  .patch(
    isAuth,
    validate(communityValidation.updateTopic),
    communityController.updateTopic
  );

// Post Routes
router.route('/topics/:topicId/posts')
  .post(
    isAuth,
    validate(communityValidation.createPost),
    communityController.createPost
  )
  .get(
    validate(communityValidation.listPosts),
    communityController.listPosts
  );

router.route('/posts/:postId')
  .patch(
    isAuth,
    validate(communityValidation.updatePost),
    communityController.updatePost
  );

router.route('/posts/:postId/like')
  .post(
    isAuth,
    communityController.togglePostLike
  );

module.exports = router;
