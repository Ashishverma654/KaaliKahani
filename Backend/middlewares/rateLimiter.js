const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (Login/Register bots)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' }
});

// Rate limiter for user interactions (Likes, Comments, Submissions) to forestall spam
exports.interactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 clicks/submissions per minute
  message: { success: false, message: 'Rate limit exceeded. Please slow down.' }
});
