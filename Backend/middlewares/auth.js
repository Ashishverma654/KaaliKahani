const jwt = require('jsonwebtoken');
const User = require('../models/User');
const formatResponse = require('../utils/response');

// Intercepts the request and protects based on JWT bearer or HTTP-Only Cookie
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return formatResponse(res, 401, 'Not authorized. Please log in to continue.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return formatResponse(res, 401, 'User account no longer exists');
    }

    // Verify token version matches user's current version (Invalidates sessions after password change)
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== req.user.tokenVersion) {
      return formatResponse(res, 401, 'Session expired due to security update. Please log in again.');
    }

    next();
  } catch (err) {
    return formatResponse(res, 401, 'Not authorized to access this route - Token failed');
  }
};

// Grant access to specific roles (Industry Standard RBAC)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return formatResponse(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

// Specialized Admin-only guard map map map
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return formatResponse(res, 403, 'Not authorized as an admin');
  }
};


