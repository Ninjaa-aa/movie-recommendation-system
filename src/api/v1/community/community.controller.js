// src/api/v1/community/community.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const { forumService, topicService, postService } = require('./community.service');

// Forum Controllers
const createForum = catchAsync(async (req, res) => {
  const forum = await forumService.createForum(req.body);
  
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Forum created successfully',
    data: forum
  });
});

const updateForum = catchAsync(async (req, res) => {
  const { forumId } = req.params;
  const forum = await forumService.updateForum(forumId, req.body);
  
  return ApiResponse.success(res, {
    message: 'Forum updated successfully',
    data: forum
  });
});

const listForums = catchAsync(async (req, res) => {
  const { category, movie, search, page, limit } = req.query;
  const forums = await forumService.listForums(
    { category, movie, search },
    page,
    limit
  );
  
  return ApiResponse.success(res, {
    message: 'Forums retrieved successfully',
    data: forums
  });
});

const getForum = catchAsync(async (req, res) => {
  const { forumId } = req.params;
  const forum = await forumService.getForum(forumId);
  
  return ApiResponse.success(res, {
    message: 'Forum retrieved successfully',
    data: forum
  });
});

const deleteForum = catchAsync(async (req, res) => {
  const { forumId } = req.params;
  const result = await forumService.deleteForum(forumId);
  
  return ApiResponse.success(res, {
    message: result.message
  });
});

// Topic Controllers
const createTopic = catchAsync(async (req, res) => {
  const { forumId } = req.params;
  const topic = await topicService.createTopic(forumId, req.user.id, req.body);
  
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Topic created successfully',
    data: topic
  });
});

const updateTopic = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const topic = await topicService.updateTopic(topicId, req.user.id, req.body);
  
  return ApiResponse.success(res, {
    message: 'Topic updated successfully',
    data: topic
  });
});

const listTopics = catchAsync(async (req, res) => {
  const { forumId } = req.params;
  const { search, tags, author, page, limit } = req.query;
  const topics = await topicService.listTopics(
    forumId,
    { search, tags, author },
    page,
    limit
  );
  
  return ApiResponse.success(res, {
    message: 'Topics retrieved successfully',
    data: topics
  });
});

// Post Controllers
const createPost = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const post = await postService.createPost(topicId, req.user.id, req.body);
  
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Post created successfully',
    data: post
  });
});

const updatePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const post = await postService.updatePost(postId, req.user.id, req.body);
  
  return ApiResponse.success(res, {
    message: 'Post updated successfully',
    data: post
  });
});

const listPosts = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const { page, limit } = req.query;
  const posts = await postService.listPosts(topicId, page, limit);
  
  return ApiResponse.success(res, {
    message: 'Posts retrieved successfully',
    data: posts
  });
});

const togglePostLike = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const result = await postService.toggleLike(postId, req.user.id);
  
  return ApiResponse.success(res, {
    message: result.liked ? 'Post liked successfully' : 'Post unliked successfully',
    data: { liked: result.liked }
  });
});

module.exports = {
  // Forum Controllers
  createForum,
  updateForum,
  listForums,
  getForum,
  deleteForum,
  
  // Topic Controllers
  createTopic,
  updateTopic,
  listTopics,
  
  // Post Controllers
  createPost,
  updatePost,
  listPosts,
  togglePostLike
};