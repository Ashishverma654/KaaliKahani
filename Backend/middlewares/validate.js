const { validationResult } = require('express-validator');
const formatResponse = require('../utils/response');

// Middleware to intercept mapped validation errors from schemas in routes
exports.validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extrapolate map into single array of strings for simple front end error consuming
    const errorArray = errors.array().map(err => err.msg);
    return formatResponse(res, 400, 'Validation Failed', { errors: errorArray });
  }
  next();
};
