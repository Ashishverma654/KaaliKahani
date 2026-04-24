const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

// Apply protection to all archival admin vectors map map
router.use(protect);
router.use(adminOnly);

// Story Moderation Routes
router.get('/stories', adminController.getAllStories);
router.patch('/stories/:id/status', adminController.updateStoryStatus);

// User Management Routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// Dashboard Overview Routes
router.get('/stats', adminController.getStats);

module.exports = router;
