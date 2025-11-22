/**
 * GIAI ĐOẠN 8: ASYNC HANDLER MIDDLEWARE
 * Wrapper để handle async functions trong Express routes
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
