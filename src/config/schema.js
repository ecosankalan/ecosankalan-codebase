const WASTE_CATEGORY_ENUM = [
  "Recyclable",
  "Organic",
  "Hazardous",
  "E-Waste",
  "Mixed",
  "Non-Recyclable",
];

const BIN_COLOR_ENUM = [
  "Blue",
  "Green",
  "Red",
  "Black",
];

const HAZARD_ENUM = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

const wasteSchema = {
  type: "object",

  properties: {
    reports: {
      type: "array",

      items: {
        type: "object",

        properties: {
          imageIndex: {
            type: "number",
          },

          identifiedObject: {
            type: "string",
          },

          material: {
            type: "string",
          },

          wasteCategory: {
            type: "string",

            enum: WASTE_CATEGORY_ENUM,
          },

          binColor: {
            type: "string",

            enum: BIN_COLOR_ENUM,
          },

          environmentFriendlyLevel: {
            type: "number",
          },

          recyclable: {
            type: "boolean",
          },

          canBeReused: {
            type: "boolean",
          },

          reuseIdeas: {
            type: "array",

            items: {
              type: "string",
            },
          },

          beforeThrowing: {
            type: "array",

            items: {
              type: "string",
            },
          },

          betterAlternatives: {
            type: "array",

            items: {
              type: "object",

              properties: {
                name: {
                  type: "string",
                },

                ecoBenefit: {
                  type: "string",
                },

                costComparison: {
                  type: "string",
                },
              },

              required: [
                "name",
                "ecoBenefit",
                "costComparison",
              ],

              additionalProperties: false,
            },
          },

          specialHandling: {
            type: "array",

            items: {
              type: "string",
            },
          },

          hazardLevel: {
            type: "string",

            enum: HAZARD_ENUM,
          },

          confidence: {
            type: "number",
          },
        },

        required: [
          "imageIndex",
          "identifiedObject",
          "material",
          "wasteCategory",
          "binColor",
          "environmentFriendlyLevel",
          "recyclable",
          "canBeReused",
          "reuseIdeas",
          "beforeThrowing",
          "betterAlternatives",
          "specialHandling",
          "hazardLevel",
          "confidence",
        ],

        additionalProperties: false,
      },
    },
  },

  required: ["reports"],

  additionalProperties: false,
};

const wasteCoreSchema = {
  type: "object",

  properties: {
    reports: {
      type: "array",

      items: {
        type: "object",

        properties: {
          imageIndex: {
            type: "number",
          },

          identifiedObject: {
            type: "string",
          },

          material: {
            type: "string",
          },

          wasteCategory: {
            type: "string",

            enum: WASTE_CATEGORY_ENUM,
          },

          binColor: {
            type: "string",

            enum: BIN_COLOR_ENUM,
          },

          environmentFriendlyLevel: {
            type: "number",
          },

          recyclable: {
            type: "boolean",
          },

          canBeReused: {
            type: "boolean",
          },

          hazardLevel: {
            type: "string",

            enum: HAZARD_ENUM,
          },

          confidence: {
            type: "number",
          },
        },

        required: [
          "imageIndex",
          "identifiedObject",
          "material",
          "wasteCategory",
          "binColor",
          "environmentFriendlyLevel",
          "recyclable",
          "canBeReused",
          "hazardLevel",
          "confidence",
        ],

        additionalProperties: false,
      },
    },
  },

  required: ["reports"],

  additionalProperties: false,
};

const wasteReuseSchema = {
  type: "object",

  properties: {
    reports: {
      type: "array",

      items: {
        type: "object",

        properties: {
          imageIndex: {
            type: "number",
          },

          reuseIdeas: {
            type: "array",

            items: {
              type: "string",
            },
          },

          beforeThrowing: {
            type: "array",

            items: {
              type: "string",
            },
          },

          betterAlternatives: {
            type: "array",

            items: {
              type: "object",

              properties: {
                name: {
                  type: "string",
                },

                ecoBenefit: {
                  type: "string",
                },

                costComparison: {
                  type: "string",
                },
              },

              required: [
                "name",
                "ecoBenefit",
                "costComparison",
              ],

              additionalProperties: false,
            },
          },

          specialHandling: {
            type: "array",

            items: {
              type: "string",
            },
          },
        },

        required: [
          "imageIndex",
          "reuseIdeas",
          "beforeThrowing",
          "betterAlternatives",
          "specialHandling",
        ],

        additionalProperties: false,
      },
    },
  },

  required: ["reports"],

  additionalProperties: false,
};

module.exports = {
  wasteSchema,
  wasteCoreSchema,
  wasteReuseSchema,
};
