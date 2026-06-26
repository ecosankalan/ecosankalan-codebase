const getOpenAIClient = require('../config/openaiClient');
const { OPENAI_VISION_MODEL } = require('../config/aiConfig');
const { WASTE_SCAN_PROMPT } = require('../config/aiPrompts');
const { wasteScanSchema } = require('../config/aiSchema');
const { buildAiInput } = require('../utils/buildAiInput');

const extractOutputText = (response) => {
  return response.choices[0]?.message?.content;
};

const analyzeWasteImages = async (files) => {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: OPENAI_VISION_MODEL,
    messages: buildAiInput(files, WASTE_SCAN_PROMPT),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'waste_scan',
        strict: true,
        schema: wasteScanSchema,
      },
    },
  });

  const outputText = extractOutputText(response);
  if (!outputText) {
    const error = new Error('AI scan returned no text output.');
    error.statusCode = 502;
    throw error;
  }

  return {
    model: OPENAI_VISION_MODEL,
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    },
    parsed: JSON.parse(outputText),
  };
};

const scanWaste = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'Upload at least one image using form-data key "images".' });
    }

    const result = await analyzeWasteImages(req.files);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return next(err);
  }
};

module.exports = { analyzeWasteImages, scanWaste };
