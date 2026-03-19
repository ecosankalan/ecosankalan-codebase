/**
 * utils/apiResponse.js
 * Standardised API response helpers.
 *
 * Why standardise responses?
 * Every endpoint returning a different shape makes frontend code messy.
 * Vipin shouldn't have to guess if success is 'ok', 'status', or 'success'.
 *
 * All EcoSankalan API responses follow this shape:
 *   Success: { success: true,  data: {...},  message: "..." }
 *   Error:   { success: false, message: "...", errors: [...] }
 */

/**
 * Send a successful response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status (default 200)
 * @param {string} message - Human-readable message
 * @param {any} data - Response payload
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response (use sparingly — prefer throwing errors
 * and letting errorHandler.js catch them).
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong') => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
