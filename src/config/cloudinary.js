/**
 * config/cloudinary.js
 * Lazy Cloudinary initialization for avatar uploads.
 */

const { v2: cloudinary } = require('cloudinary');

let initialized = false;

const getCloudinary = () => {
  if (!initialized) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const error = new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
      error.statusCode = 500;
      throw error;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    initialized = true;
  }

  return cloudinary;
};

module.exports = getCloudinary;
