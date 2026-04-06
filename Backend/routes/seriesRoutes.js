const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const seriesController = require('../controllers/seriesController');

router.post('/', protect, seriesController.createSeries);
router.get('/me', protect, seriesController.getMySeries);
router.get('/:id', seriesController.getSeriesById);

module.exports = router;
