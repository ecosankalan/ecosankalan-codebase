/**
 * middleware/validate.js
 * Validation result checker for express-validator.
 *
 * Pattern:
 *   router.post('/register',
 *     [body('email').isEmail(), body('password').isLength({ min: 8 })],
 *     validate,        ← this middleware runs AFTER the validators
 *     authController.register
 *   );
 *
 * If validation fails, it returns a 422 with a clean list of field errors
 * before the controller ever runs. Keeps controllers clean.
 */

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
