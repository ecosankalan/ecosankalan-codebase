const multer = require('multer');
const { MAX_AI_FILES, MAX_AI_FILE_SIZE } = require('../config/aiConfig');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_AI_FILES,
    fileSize: MAX_AI_FILE_SIZE,
  },
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only JPG, PNG and WEBP images are allowed.');
      error.statusCode = 415;
      return cb(error);
    }
    return cb(null, true);
  },
});

const uploadAiImages = (req, res, next) => {
  upload.array('images', MAX_AI_FILES)(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Image exceeds the upload size limit.' });
      }
      return res.status(400).json({ success: false, message: 'Image upload failed.' });
    }

    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Image upload failed.',
    });
  });
};

/**
 * Single live-photo upload (bin requests). Same storage + mime rules as AI images.
 * Field name: "photo". Max 1 file.
 */
const uploadSinglePhoto = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Photo exceeds the upload size limit.' });
      }
      return res.status(400).json({ success: false, message: 'Photo upload failed.' });
    }

    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Photo upload failed.',
    });
  });
};

module.exports = { uploadAiImages, uploadSinglePhoto };
