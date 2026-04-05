const formatResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log strictly to console for developer environment tracing
  console.error(err.stack);

  // Mongoose Bad ObjectId logic
  if (err.name === 'CastError') {
    const message = `Resource not found with requested ID`;
    return formatResponse(res, 404, message);
  }

  // Mongoose Duplicate Constraint Map Error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered. Record already exists';
    return formatResponse(res, 400, message);
  }

  // Mongoose Validation Loop Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return formatResponse(res, 400, message);
  }

  // Default Catch All
  formatResponse(res, error.statusCode || 500, error.message || 'Server Error');
};

module.exports = errorHandler;
