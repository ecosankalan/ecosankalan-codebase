/**
 * middleware/avatarUpload.js
 * Multer middleware for secure avatar uploads.
 */

const multer = require('multer');

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error('Invalid avatar file type. Only JPG, PNG, and WEBP are allowed.');
    err.statusCode = 415;
    return cb(err);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Avatar size exceeds 2MB limit.' });
      }

      return res.status(400).json({ message: 'Avatar upload failed. Please upload a single valid image file.' });
    }

    return res.status(err.statusCode || 400).json({ message: err.message || 'Avatar upload failed.' });
  });
};

module.exports = uploadAvatar;
