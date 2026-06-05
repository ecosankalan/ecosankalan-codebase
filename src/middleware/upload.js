const multer = require("multer");
const sharp = require("sharp");
const {
  MAX_FILE_SIZE,
  MAX_IMAGE_DIMENSION,
  IMAGE_QUALITY,
  COMPRESS_OVER_BYTES,
} = require("../config/env.js");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const resizeImages = async (req, res, next) => {
  if (!req.files?.length) {
    return next();
  }

  try {
    const resized = await Promise.all(
      req.files.map(async (file) => {
        if (file.size <= COMPRESS_OVER_BYTES) {
          return file;
        }

        const buffer = await sharp(file.buffer)
          .rotate()
          .resize({
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          })
          .flatten({ background: "#ffffff" })
          .jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })
          .toBuffer();

        return {
          ...file,
          buffer,
          mimetype: "image/jpeg",
          size: buffer.length,
        };
      })
    );

    req.files = resized;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upload,
  resizeImages,
};
