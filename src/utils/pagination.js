// src/utils/pagination.js
const getPagination = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    take: parseInt(limit)
  };
};

module.exports = { getPagination };