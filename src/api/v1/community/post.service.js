// src/api/v1/community/post.service.js
class PostService {
  async createPost(topicId, userId, postData) {
    try {
      const topic = await Topic.findOne({ _id: topicId, isActive: true });
      if (!topic) {
        throw new ApiError(404, 'Topic not found');
      }

      if (topic.isLocked) {
        throw new ApiError(403, 'This topic is locked');
      }

      if (postData.parentPost) {
        const parentPost = await Post.findOne({ 
          _id: postData.parentPost,
          topic: topicId,
          isActive: true 
        });
        if (!parentPost) {
          throw new ApiError(404, 'Parent post not found');
        }
      }

      const post = await Post.create({
        ...postData,
        topic: topicId,
        author: userId
      });

      // Update topic statistics
      topic.totalReplies += 1;
      topic.lastReply = post._id;
      await topic.save();

      // Update forum statistics
      const forum = await Forum.findById(topic.forum);
      forum.totalPosts += 1;
      forum.lastPost = post._id;
      await forum.save();

      // Process mentions and send notifications
      if (postData.mentions?.length) {
        // Implement notification sending logic here
      }

      return await post.populate([
        { path: 'author', select: 'name avatar' },
        { path: 'mentions', select: 'name avatar' },
        { 
          path: 'parentPost',
          populate: { path: 'author', select: 'name avatar' }
        }
      ]);
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error creating post');
    }
  }

  async updatePost(postId, userId, updateData) {
    try {
      const post = await Post.findOne({ _id: postId, isActive: true });
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      // Check if user is author or moderator
      const topic = await Topic.findById(post.topic);
      const forum = await Forum.findById(topic.forum);
      const isModerator = forum.moderators.includes(userId);
      
      if (!isModerator && post.author.toString() !== userId) {
        throw new ApiError(403, 'Not authorized to update this post');
      }

      // Store edit history
      post.editHistory.push({
        content: post.content,
        editedAt: new Date()
      });

      post.isEdited = true;
      Object.assign(post, updateData);
      await post.save();

      return await post.populate([
        { path: 'author', select: 'name avatar' },
        { path: 'mentions', select: 'name avatar' },
        { 
          path: 'parentPost',
          populate: { path: 'author', select: 'name avatar' }
        }
      ]);
    } catch (error) {
      logger.error('Error updating post:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error updating post');
    }
  }

  async listPosts(topicId, page = 1, limit = 20) {
    try {
      const query = { 
        topic: topicId,
        isActive: true 
      };

      const posts = await Post.find(query)
        .populate([
          { path: 'author', select: 'name avatar' },
          { path: 'mentions', select: 'name avatar' },
          { 
            path: 'parentPost',
            populate: { path: 'author', select: 'name avatar' }
          }
        ])
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Post.countDocuments(query);

      return {
        results: posts,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error listing posts:', error);
      throw new ApiError(500, 'Error listing posts');
    }
  }

  async toggleLike(postId, userId) {
    try {
      const post = await Post.findOne({ _id: postId, isActive: true });
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      const liked = post.likes.includes(userId);
      if (liked) {
        post.likes.pull(userId);
      } else {
        post.likes.push(userId);
      }

      await post.save();
      return { liked: !liked };
    } catch (error) {
      logger.error('Error toggling post like:', error);
      throw error instanceof ApiError ? error : new ApiError(500, 'Error toggling post like');
    }
  }
}

module.exports = PostService;