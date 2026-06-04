const buildInput = (files, modelName, basePrompt, modelPrompts) => {
  const modelPrompt = modelPrompts[modelName] || "";
  const input = [];

  input.push({
    role: "system",
    content: [
      {
        type: "input_text",
        text: `\n${basePrompt}\n\n${modelPrompt}\n`,
      },
    ],
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const base64 = file.buffer.toString("base64");

    input.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Analyze image ${i + 1}`,
        },
        {
          type: "input_image",
          image_url: `data:${file.mimetype};base64,${base64}`,
        },
      ],
    });
  }

  return input;
};

module.exports = {
  buildInput,
};
