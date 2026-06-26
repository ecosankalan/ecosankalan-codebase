const OpenAI = require('openai');
const { OPENAI_API_KEY } = require('./aiConfig');

let client = null;

const getOpenAIClient = () => {
  if (!OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is required for AI scan.');
    error.statusCode = 500;
    throw error;
  }

  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return client;
};

module.exports = getOpenAIClient;
