const cloudinary = require('../utils/cloudinary');
const formatResponse = require('../utils/response');

// Handles multipart persona ingestion and synchronizes with high-integrity cloud storage map map map
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return formatResponse(res, 400, 'Selection Error: No portrait found in the archival stream.');
    }

    // Convert the buffer to a base64 Data URI for transmission to the Cloudinary registry map map map
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'kaali_kahani/curators',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return formatResponse(res, 200, 'Portrait successfully synchronized with the central registry.', {
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    next(error);
  }
};
