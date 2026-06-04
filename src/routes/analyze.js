const express = require("express");
const { upload, resizeImages } = require("../middleware/upload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { createHttpError } = require("../utils/httpError.js");
const { BASE_PROMPT, MODEL_PROMPTS } = require("../config/prompts.js");
const { MAX_FILES } = require("../config/env.js");
const { runPipeline } = require("../controllers/analyzeController.js");

const router = express.Router();

router.post(
  "/analyze",
  upload.array("images", MAX_FILES),
  resizeImages,
  asyncHandler(async (req, res) => {
    const files = req.files;

    if (!files?.length) {
      throw createHttpError(400, "No images uploaded");
    }

    const pipelineResult = await runPipeline(
      files,
      BASE_PROMPT,
      MODEL_PROMPTS
    );

    res.json({
      success: true,
      totalModels: 1,
      results: [pipelineResult],
    });
  })
);

module.exports = router;
