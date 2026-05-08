const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middlewares/auth');
const { interactionLimiter } = require('../middlewares/rateLimiter');
const { check } = require('express-validator');
const { validateResult } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

// Public Routes
router.get('/featured', storyController.getFeaturedStory);
router.get('/search', storyController.searchStories);
router.get('/', storyController.getStories);
router.get('/me', protect, storyController.getMyStories);
router.get('/drafts', protect, storyController.getMyDrafts);
router.get('/bookmarks', protect, storyController.getMyBookmarks);
router.get('/liked', protect, storyController.getMyLikedStories);
router.get('/draft/:id', protect, storyController.getDraftById);
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

// Draft Routes
router.post('/draft', protect, storyController.saveDraft);
router.put('/draft/:id', protect, storyController.updateDraft);

// Advanced Archival Routes (Image Uplink & AI Sense)
router.post('/upload', protect, upload.single('image'), storyController.uploadImage);
router.post('/analyze', protect, storyController.analyzeStory);
router.post('/refine', protect, storyController.refineStory);

router.post('/:id/like', protect, interactionLimiter, storyController.addLike);
router.get('/:id/like', protect, storyController.checkLike);
router.post('/:id/bookmark', protect, interactionLimiter, storyController.addBookmark);
router.get('/:id/bookmark', protect, storyController.checkBookmark);

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
