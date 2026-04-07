/**
 * middleware/errorHandler.js
 * Global Error Handler Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

const { Prisma } = require('@prisma/client');

if (err instanceof Prisma.PrismaClientKnownRequestError) {
  // Unique constraint
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: `Duplicate field: ${err.meta.target}`
    });
  }

  // Foreign key error
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference ID'
    });
  }
}
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;