const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { forumService, topicService, postService } = require('../services/community.service');
const logger = require('../utils/logger');

class CommunityController {
  // Forum Controllers
  createForum = catchAsync(async (req, res) => {
    const forum = await forumService.createForum({
      ...req.body,
      creator: req.user.id
    });
    
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Forum created successfully',
      data: { forum }
    });
  });

  updateForum = catchAsync(async (req, res) => {
    const { forumId } = req.params;
    const forum = await forumService.updateForum(forumId, req.body);
    
    return ApiResponse.success(res, {
      message: 'Forum updated successfully',
      data: { forum }
    });
  });

  listForums = catchAsync(async (req, res) => {
    const { category, movie, search, page = 1, limit = 20 } = req.query;
    
    const forums = await forumService.listForums(
      { 
        category, 
        movie, 
        search
      },
      parseInt(page),
      parseInt(limit)
    );
    
    return ApiResponse.success(res, {
      message: 'Forums retrieved successfully',
      data: forums
    });
  });

  getForum = catchAsync(async (req, res) => {
    const { forumId } = req.params;
    const forum = await forumService.getForum(forumId);
    
    return ApiResponse.success(res, {
      message: 'Forum retrieved successfully',
      data: { forum }
    });
  });

  deleteForum = catchAsync(async (req, res) => {
    const { forumId } = req.params;
    await forumService.deleteForum(forumId);
    
    return ApiResponse.success(res, {
      message: 'Forum deleted successfully'
    });
  });

  // Topic Controllers
  createTopic = catchAsync(async (req, res) => {
    const { forumId } = req.params;
    
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required to create a topic');
    }

    const topicData = {
      ...req.body,
      author: req.user.id,
      forum: forumId
    };

    logger.debug('Creating topic with data:', { 
      forumId, 
      userId: req.user.id, 
      topicData: { ...topicData, content: 'CONTENT_TRUNCATED' } 
    });

    const topic = await topicService.createTopic(forumId, req.user.id, topicData);
    
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Topic created successfully',
      data: { topic }
    });
  });

  updateTopic = catchAsync(async (req, res) => {
    const { topicId } = req.params;
    
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required to update a topic');
    }

    const topic = await topicService.updateTopic(topicId, req.user.id, req.body);
    
    return ApiResponse.success(res, {
      message: 'Topic updated successfully',
      data: { topic }
    });
  });

  listTopics = catchAsync(async (req, res) => {
    const { forumId } = req.params;
    const { 
      search, 
      tags, 
      sort = 'newest',
      page = 1, 
      limit = 20 
    } = req.query;

    logger.debug('Listing topics with params:', { 
      forumId, 
      filters: { search, tags, sort },
      pagination: { page, limit }
    });

    // Parse tags if they're provided as a comma-separated string
    const parsedTags = tags ? 
      (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : 
      undefined;

    const topics = await topicService.listTopics(
      forumId,
      { 
        search,
        tags: parsedTags,
        sort
      },
      parseInt(page),
      parseInt(limit)
    );
    
    return ApiResponse.success(res, {
      message: 'Topics retrieved successfully',
      data: topics
    });
  });

  // Post Controllers
  createPost = catchAsync(async (req, res) => {
    const { topicId } = req.params;
    
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required to create a post');
    }

    const post = await postService.createPost(
      topicId, 
      req.user.id, 
      req.body
    );
    
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Post created successfully',
      data: { post }
    });
  });

  updatePost = catchAsync(async (req, res) => {
    const { postId } = req.params;
    
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required to update a post');
    }

    const post = await postService.updatePost(postId, req.user.id, req.body);
    
    return ApiResponse.success(res, {
      message: 'Post updated successfully',
      data: { post }
    });
  });

  listPosts = catchAsync(async (req, res) => {
    const { topicId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const posts = await postService.listPosts(
      topicId, 
      parseInt(page), 
      parseInt(limit)
    );
    
    return ApiResponse.success(res, {
      message: 'Posts retrieved successfully',
      data: posts
    });
  });

  togglePostLike = catchAsync(async (req, res) => {
    const { postId } = req.params;
    
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required to like/unlike a post');
    }

    const result = await postService.toggleLike(postId, req.user.id);
    
    return ApiResponse.success(res, {
      message: result.liked ? 'Post liked successfully' : 'Post unliked successfully',
      data: { 
        liked: result.liked,
        likeCount: result.likeCount 
      }
    });
  });
}

module.exports = new CommunityController();