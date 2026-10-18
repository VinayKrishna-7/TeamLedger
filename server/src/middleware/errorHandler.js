export const errorHandler = (err, req, res, next) => {
  // Log server-side for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred';

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle Mongoose CastError (invalid ObjectId or type casting)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value provided for ${err.path}`;
  }

  // Handle duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate record found with the same identifier';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
