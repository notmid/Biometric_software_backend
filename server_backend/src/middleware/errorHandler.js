// Centralized error handler — any route that calls next(err) or throws
// inside an async handler wrapped with asyncHandler ends up here, so
// error responses stay consistent across the whole API.
export function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server.',
  });
}

// Wraps an async route handler so thrown errors get passed to errorHandler
// instead of crashing the process or needing a try/catch in every route.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
