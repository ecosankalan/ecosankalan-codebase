const getOpenAIClient = require('../config/openaiClient');
const { OPENAI_VISION_MODEL } = require('../config/aiConfig');

/**
 * Calculates the exact Eco Points awarded for a waste log using OpenAI.
 * @param {string} category - The category of the waste
 * @param {number} kgQty - The quantity in kilograms
 * @param {string} description - The user description of the waste
 * @returns {Promise<{ pointsEarned: number }>}
 */
const calculateWasteImpact = async (category, kgQty, description) => {
  const systemPrompt = `You are an environmental impact calculator.
Given a specific waste item's category, description, and weight (in kg), calculate one thing:
1. "pointsEarned": Eco points awarded (integer). Generally, higher impact/harder to recycle items like e-waste get more points (~10 pts/kg), plastics (~5 pts/kg), organics (~3 pts/kg). Adjust dynamically based on the description (e.g. if the item is very hazardous or rare, give slightly more points).

Return EXACTLY a JSON object matching this schema, with no markdown formatting:
{
  "pointsEarned": <integer>
}
`;

  const userPrompt = `Waste Category: ${category}
Description: ${description || 'No description provided'}
Weight: ${kgQty} kg

Calculate the pointsEarned for this specific amount of waste.`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: OPENAI_VISION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      pointsEarned: Math.max(0, Math.round(result.pointsEarned || 0))
    };
  } catch (error) {
    console.error('AI Calculation error:', error);
    // Absolute baseline fallback just in case the API goes down
    return {
      pointsEarned: Math.max(1, Math.round(kgQty * 2))
    };
  }
};

module.exports = { calculateWasteImpact };
