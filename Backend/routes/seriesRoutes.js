const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const seriesController = require('../controllers/seriesController');

// Authenticated user routes
router.post('/', protect, seriesController.createSeries);
router.get('/me', protect, seriesController.getMySeries);

// Public route — get series details + stories
router.get('/:id', seriesController.getSeriesById);

module.exports = router;
