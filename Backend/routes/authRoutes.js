const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateResult } = require('../middlewares/validate');

// Public endpoints
router.post(
  '/register',
  authLimiter,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  validateResult,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  validateResult,
  authController.login
);

router.post(
  '/admin/login',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  validateResult,
  authController.adminLogin
);

const { protect } = require('../middlewares/auth');

// Refresh Token Generator Route
router.post(
  '/refresh',
  authController.refreshToken
);

// Get current logged in user
router.get('/me', protect, authController.getMe);

// Update profile
router.put('/profile', protect, authController.updateProfile);

// Change password
router.post('/change-password', protect, authController.changePassword);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
