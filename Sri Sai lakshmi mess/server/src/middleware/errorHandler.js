const config = require('../config');

// Catch 404 and forward to error handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central Error handling middleware
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Unable to process your request',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
