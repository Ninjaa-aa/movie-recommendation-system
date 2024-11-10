// src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const { ApiError } = require('../utils/apiResponse');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/movies'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'movie-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ApiError(400, 'Only .jpeg, .jpg and .png files are allowed!'), false);
    return;
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = { upload };