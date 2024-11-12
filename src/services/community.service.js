const ForumService = require('./forum.service');
const TopicService = require('./topic.service');
const PostService = require('./post.service');

module.exports = {
  forumService: new ForumService(),
  topicService: new TopicService(),
  postService: new PostService()
};