const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// Impose dual-lock architecture -> Must be Logged In AND hold 'admin' role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Restricted Endpoints
router.get('/dashboard', adminController.getDashboardStats);
router.get('/stories', adminController.getStories);
router.get('/stories/:id', adminController.getStoryById);
router.get('/pending', adminController.getPendingStories);

router.put('/stories/:id/approve', adminController.approveStory);
router.put('/stories/:id/reject', adminController.rejectStory);
router.put('/stories/:id', adminController.updateStory);
router.delete('/stories/:id', adminController.deleteStory);

router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-block', adminController.toggleUserBlock);

router.get('/comments', adminController.getComments);
router.post('/comments/approve-bulk', adminController.bulkApproveComments);
router.put('/comments/:id/approve', adminController.approveComment);
router.put('/comments/:id/reject', adminController.rejectComment);
router.delete('/comments/:id', adminController.deleteComment);
router.get('/logs', adminController.getAuditLogs);

// Central Registry Tuning
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
