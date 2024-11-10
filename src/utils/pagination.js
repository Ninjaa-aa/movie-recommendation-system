// utils/pagination.js
const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: parseInt(limit)
  };
};
module.exports = { getPagination };