// src/middleware/role.middleware.js
const ApiError = require('../utils/ApiError'); // Changed from apiResponse to ApiError

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { authorizeRoles };