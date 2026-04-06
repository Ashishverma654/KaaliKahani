const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const progressController = require('../controllers/progressController');

router.get('/:id', protect, progressController.getProgress);
router.put('/:id', protect, progressController.updateProgress);

module.exports = router;
