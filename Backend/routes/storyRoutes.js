const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middlewares/auth');
const { interactionLimiter } = require('../middlewares/rateLimiter');
const { check } = require('express-validator');
const { validateResult } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

// Public Routes
router.get('/', storyController.getStories);
router.get('/me', protect, storyController.getMyStories);
router.get('/:slug', storyController.getStoryBySlug);

// Protected User Routes (Implicitly blocks unauthenticated traffic map)
router.post(
  '/',
  protect,
  interactionLimiter,
  [
    check('title', 'Title payload is required').not().isEmpty(),
    check('content', 'Story logic payload is required').not().isEmpty()
  ],
  validateResult,
  storyController.submitStory
);

// Advanced Archival Routes (Image Uplink & AI Sense)
router.post('/upload', protect, upload.single('image'), storyController.uploadImage);
router.post('/analyze', protect, storyController.analyzeStory);

router.post('/:id/like', protect, interactionLimiter, storyController.addLike);

router.post(
  '/:id/comment',
  protect,
  interactionLimiter,
  [
    check('content', 'Comment text content is required').not().isEmpty()
  ],
  validateResult,
  storyController.addComment
);

module.exports = router;
