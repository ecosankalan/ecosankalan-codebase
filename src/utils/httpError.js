const createHttpError = (statusCode, publicMessage, originalError) => {
  const message = originalError?.message || publicMessage;
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
};

module.exports = {
  createHttpError,
};
