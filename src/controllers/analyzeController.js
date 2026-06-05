const { performance } = require("perf_hooks");
const client = require("./openaiClient");
const {
  wasteSchema,
  wasteCoreSchema,
  wasteReuseSchema,
} = require("../config/schema.js");
const { buildInput } = require("../utils/buildInput.js");
const { MODELS } = require("../config/models.js");

const extractOutputText = (response) => {
  return response.output
    .flatMap((item) => item.content || [])
    .find((content) => content.type === "output_text")?.text;
};

const runModel = async (
  modelName,
  files,
  basePrompt,
  modelPrompts,
  schema = wasteSchema
) => {
  const started = performance.now();

  try {
    const response = await client.responses.create({
      model: modelName,
      input: buildInput(files, modelName, basePrompt, modelPrompts),
      text: {
        format: {
          type: "json_schema",
          name: "waste_detection",
          strict: true,
          schema,
        },
      },
    });

    const parsedText = extractOutputText(response);

    if (!parsedText) {
      throw new Error("No output text found");
    }

    const parsed = JSON.parse(parsedText);

    return {
      success: true,
      model: modelName,
      latencyMs: Math.round(performance.now() - started),
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
        totalTokens: response.usage?.total_tokens,
      },
      parsed,
      rawText: parsedText,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      model: modelName,
      latencyMs: Math.round(performance.now() - started),
      usage: null,
      parsed: null,
      rawText: null,
      error: {
        message: error.message,
      },
    };
  }
};

const runAllModels = async (models, files, basePrompt, modelPrompts) => {
  const settled = await Promise.allSettled(
    models.map((modelName) =>
      runModel(modelName, files, basePrompt, modelPrompts)
    )
  );

  return settled.map((item) =>
    item.status === "fulfilled"
      ? item.value
      : {
          success: false,
          error: item.reason,
        }
  );
};

const mergeReport = (report41, report54, fallbackIndex) => {
  const preferred = report41 || report54 || {};

  return {
    imageIndex: preferred.imageIndex ?? fallbackIndex,
    identifiedObject: report41?.identifiedObject ?? report54?.identifiedObject,
    material: report41?.material ?? report54?.material,
    wasteCategory: report41?.wasteCategory ?? report54?.wasteCategory,
    binColor: report41?.binColor ?? report54?.binColor,
    environmentFriendlyLevel:
      report41?.environmentFriendlyLevel ??
      report54?.environmentFriendlyLevel,
    recyclable: report41?.recyclable ?? report54?.recyclable,
    canBeReused: report41?.canBeReused ?? report54?.canBeReused,
    reuseIdeas: report54?.reuseIdeas ?? report41?.reuseIdeas,
    beforeThrowing: report54?.beforeThrowing ?? report41?.beforeThrowing,
    betterAlternatives:
      report54?.betterAlternatives ?? report41?.betterAlternatives,
    specialHandling:
      report54?.specialHandling ?? report41?.specialHandling,
    hazardLevel: report41?.hazardLevel ?? report54?.hazardLevel,
    confidence: report41?.confidence ?? report54?.confidence,
  };
};

const mergeReports = (reports41 = [], reports54 = []) => {
  const map41 = new Map(
    reports41.map((report) => [report.imageIndex, report])
  );
  const map54 = new Map(
    reports54.map((report) => [report.imageIndex, report])
  );

  const indexes = new Set([
    ...map41.keys(),
    ...map54.keys(),
  ]);

  if (!indexes.size) {
    const maxLength = Math.max(
      reports41.length,
      reports54.length
    );

    return Array.from({ length: maxLength }, (_, i) =>
      mergeReport(reports41[i], reports54[i], i + 1)
    );
  }

  return Array.from(indexes)
    .sort((a, b) => a - b)
    .map((index, i) =>
      mergeReport(map41.get(index), map54.get(index), i + 1)
    );
};

const runPipeline = async (files, basePrompt, modelPrompts) => {
  const started = performance.now();

  const [result41, result54] = await Promise.all([
    runModel(
      MODELS.gpt41,
      files,
      basePrompt,
      modelPrompts,
      wasteCoreSchema
    ),
    runModel(
      MODELS.gpt54,
      files,
      basePrompt,
      modelPrompts,
      wasteReuseSchema
    ),
  ]);

  if (!result41.success && !result54.success) {
    return {
      success: false,
      model: "gpt-4.1 + gpt-5.4 pipeline",
      latencyMs: Math.round(performance.now() - started),
      usage: null,
      parsed: null,
      rawText: null,
      error: {
        message: "Both models failed",
        details: {
          gpt41: result41.error,
          gpt54: result54.error,
        },
      },
    };
  }

  if (result41.success && !result54.success) {
    return {
      ...result41,
      model: "gpt-4.1 + gpt-5.4 pipeline",
    };
  }

  if (!result41.success && result54.success) {
    return {
      ...result54,
      model: "gpt-4.1 + gpt-5.4 pipeline",
    };
  }

  const reports = mergeReports(
    result41.parsed?.reports,
    result54.parsed?.reports
  );

  const usage = {
    inputTokens:
      (result41.usage?.inputTokens || 0) +
      (result54.usage?.inputTokens || 0),
    outputTokens:
      (result41.usage?.outputTokens || 0) +
      (result54.usage?.outputTokens || 0),
    totalTokens:
      (result41.usage?.totalTokens || 0) +
      (result54.usage?.totalTokens || 0),
  };

  return {
    success: true,
    model: "gpt-4.1 + gpt-5.4 pipeline",
    latencyMs: Math.round(performance.now() - started),
    usage,
    parsed: {
      reports,
    },
    rawText: null,
    error: null,
  };
};

module.exports = {
  runAllModels,
  runPipeline,
};
