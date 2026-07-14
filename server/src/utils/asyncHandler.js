/**
 * Wraps an async Express route/controller so rejected promises are
 * forwarded to next(err) instead of crashing the process or hanging
 * the request. Removes the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
