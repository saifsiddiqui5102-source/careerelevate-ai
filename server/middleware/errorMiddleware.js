import logger from '../config/logger.js';

// Custom Operational App Error Class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found Middleware Handler
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot find route ${req.originalUrl} on this server`, 404);
  next(error);
};

// Centralized Express Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid resource ID format: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    err.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    err.message = `Duplicate field value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle JWT Signature Errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid authentication token. Please log in again.';
  }

  // Handle JWT Expiry Errors
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Authentication token has expired. Please log in again.';
  }

  // Log error via Winston Logger
  logger.error(`[SERVER ERROR ${err.statusCode}] ${err.message}`, {
    statusCode: err.statusCode,
    method: req.method,
    route: req.originalUrl,
    stack: err.stack
  });

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};
