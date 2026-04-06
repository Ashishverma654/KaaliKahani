const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/auth');
const uploadController = require('../controllers/uploadController');

// Memory storage registry for high-speed archival ingestion map map map
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB Archival Limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Selection Error: Only photographic imagery is accepted in the registry.'), false);
    }
  }
});

// Portrait Synchronisation Vector map map map
router.post('/avatar', protect, upload.single('avatar'), uploadController.uploadAvatar);

module.exports = router;
