const wasteScanSchema = {
  type: 'object',
  properties: {
    reports: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          imageIndex: { type: 'number' },
          identifiedObject: { type: 'string' },
          material: { type: 'string' },
          wasteCategory: {
            type: 'string',
            enum: ['Recyclable', 'Organic', 'Hazardous', 'E-Waste', 'Mixed', 'Non-Recyclable'],
          },
          binColor: {
            type: 'string',
            enum: ['Blue', 'Green', 'Red', 'Black'],
          },
          recyclable: { type: 'boolean' },
          canBeReused: { type: 'boolean' },
          reuseIdeas: {
            type: 'array',
            items: { type: 'string' },
          },
          beforeThrowing: {
            type: 'array',
            items: { type: 'string' },
          },
          betterAlternatives: {
            type: 'array',
            items: { type: 'string' },
          },
          specialHandling: {
            type: 'array',
            items: { type: 'string' },
          },
          confidence: { type: 'number' },
        },
        required: [
          'imageIndex',
          'identifiedObject',
          'material',
          'wasteCategory',
          'binColor',
          'recyclable',
          'canBeReused',
          'reuseIdeas',
          'beforeThrowing',
          'betterAlternatives',
          'specialHandling',
          'confidence',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['reports'],
  additionalProperties: false,
};

module.exports = { wasteScanSchema };
