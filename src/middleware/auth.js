/**
 * middleware/auth.js
 * JWT Authentication Middleware
 *
 * How Express middleware works:
 *   Request → [auth middleware] → [route handler] → Response
 *                     ↓
 *            If token invalid → send 401, stop here
 *            If token valid   → attach user to req, call next()
 *
 * A middleware is just a function with (req, res, next) signature.
 * Calling next() passes control to the next middleware/route.
 * NOT calling next() stops the request right there.
 *
 * Note: Month 2 auth spec uses JWT payload { userId, email, role }.
 * Keep payload minimal (no password/OTP or other sensitive fields).
 */

const jwt = require('jsonwebtoken');

/**
 * Protects routes that require authentication.
 * Usage: router.get('/profile', protect, userController.getProfile)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    //    Expected format: "Bearer eyJhbGciOiJI..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token signature and expiry
    //    jwt.verify throws if token is invalid or expired — caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the decoded payload to req so downstream handlers can use it
    //    Token payload includes { userId, email, role } (Month 2 auth spec)
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next(); // token is valid — let the request through

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

/**
 * Role-based access control middleware.
 * Usage: router.delete('/product/:id', protect, authorize('admin', 'seller'), ...)
 *
 * Always use AFTER protect — needs req.user to be set first.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
