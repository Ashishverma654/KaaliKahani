const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// Impose dual-lock architecture -> Must be Logged In AND hold 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Restricted Endpoints
router.get('/dashboard', adminController.getDashboardStats);
router.get('/stories', adminController.getStories);
router.get('/pending', adminController.getPendingStories);

router.put('/stories/:id/approve', adminController.approveStory);
router.put('/stories/:id/reject', adminController.rejectStory);
router.delete('/stories/:id', adminController.deleteStory);

router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-block', adminController.toggleUserBlock);

router.get('/comments', adminController.getComments);
router.get('/logs', adminController.getAuditLogs);

// Central Registry Tuning
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
