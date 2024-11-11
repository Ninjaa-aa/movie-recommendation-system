// src/api/v1/news/news.controller.js
const { catchAsync } = require('../../../utils/catchAsync');
const { ApiResponse } = require('../../../utils/apiResponse');
const newsService = require('./news.service');

const createNews = catchAsync(async (req, res) => {
  const authorId = req.user.id;
  const news = await newsService.createNews(req.body, authorId);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'News article created successfully',
    data: news
  });
});

const updateNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const authorId = req.user.id;
  const news = await newsService.updateNews(newsId, req.body, authorId);

  return ApiResponse.success(res, {
    message: 'News article updated successfully',
    data: news
  });
});

const deleteNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const authorId = req.user.id;
  await newsService.deleteNews(newsId, authorId);

  return ApiResponse.success(res, {
    message: 'News article deleted successfully'
  });
});

const getNews = catchAsync(async (req, res) => {
  const { page, limit, category, tag, searchTerm, highlighted } = req.query;
  const news = await newsService.getNews(
    { category, tag, searchTerm, highlighted },
    page,
    limit
  );

  return ApiResponse.success(res, {
    message: 'News articles retrieved successfully',
    data: news
  });
});

const getNewsById = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const news = await newsService.getNewsById(newsId);

  return ApiResponse.success(res, {
    message: 'News article retrieved successfully',
    data: news
  });
});

const getNewsBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const news = await newsService.getNewsBySlug(slug);

  return ApiResponse.success(res, {
    message: 'News article retrieved successfully',
    data: news
  });
});

const getRelatedNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const { limit } = req.query;
  const news = await newsService.getRelatedNews(newsId, limit);

  return ApiResponse.success(res, {
    message: 'Related news articles retrieved successfully',
    data: news
  });
});

const getTrendingNews = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const news = await newsService.getTrendingNews(limit);

  return ApiResponse.success(res, {
    message: 'Trending news articles retrieved successfully',
    data: news
  });
});

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  getNews,
  getNewsById,
  getNewsBySlug,
  getRelatedNews,
  getTrendingNews
};