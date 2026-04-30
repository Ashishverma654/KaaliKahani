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
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Comments Management Routes
router.get('/comments', adminController.getAllComments);
router.patch('/comments/:id/flag', adminController.toggleCommentFlag);
router.delete('/comments/:id', adminController.deleteComment);

// Dashboard & Analytics Routes
router.get('/stats', adminController.getStats);
router.get('/stats/extended', adminController.getExtendedStats);
router.get('/stats/top-content', adminController.getTopContent);
router.get('/stats/analytics', adminController.getAnalytics);
router.get('/stats/devices', adminController.getDeviceStats);

// Settings Routes
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Global Search
router.get('/search', adminController.globalSearch);

module.exports = router;
