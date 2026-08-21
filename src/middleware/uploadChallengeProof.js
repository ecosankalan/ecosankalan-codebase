const multer = require('multer');

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PROOF_SIZE_BYTES,
    files: 1,
  },
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only JPG, PNG, and WEBP images are allowed.');
      error.statusCode = 415;
      return cb(error);
    }
    return cb(null, true);
  },
});

const uploadChallengeProof = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'Image exceeds the 5MB upload limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Image upload failed.',
      });
    }

    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Image upload failed.',
    });
  });
};

module.exports = uploadChallengeProof;
