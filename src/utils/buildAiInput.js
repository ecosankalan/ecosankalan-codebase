const buildAiInput = (files, prompt) => {
  const content = [{ type: 'text', text: prompt }];

  files.forEach((file) => {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      },
    });
  });

  return [{ role: 'user', content }];
};

module.exports = { buildAiInput };
