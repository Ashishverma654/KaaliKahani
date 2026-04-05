const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration Registry
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Archival Storage Protocol: Cloudinary
 * Handles image beaming to the 'KaaliKahani' media registry.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'KaaliKahani/Stories',
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 675, crop: 'limit' }] // Optimize for atmospheric display
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Registry Cap
});

module.exports = upload;
