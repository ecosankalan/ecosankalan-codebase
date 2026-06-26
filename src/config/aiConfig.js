require('dotenv').config();

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
  MAX_AI_FILES: toPositiveNumber(process.env.MAX_AI_FILES, 5),
  MAX_AI_FILE_SIZE: toPositiveNumber(process.env.MAX_AI_FILE_SIZE, 10 * 1024 * 1024),
};
