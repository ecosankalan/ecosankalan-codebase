/**
 * utils/asyncHandler.js
 * Wraps async route handlers to avoid try/catch boilerplate.
 *
 * Without this utility, every controller function needs:
 *   async (req, res, next) => {
 *     try { ... }
 *     catch (err) { next(err) }
 *   }
 *
 * With this utility:
 *   router.get('/profile', protect, asyncHandler(userController.getProfile))
 *
 * Any thrown error is automatically caught and passed to errorHandler.
 * Use this wrapper on every async controller function in Month 2+.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
