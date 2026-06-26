/**
 * middleware/auth.js
 * Clerk Authentication Middleware
 *
 * Uses @clerk/express to verify session JWTs.
 * clerkMiddleware() in app.js attaches req.auth().
 * requireAuth() here blocks unauthenticated requests.
 *
 * After requireAuth, getAuth(req) gives you:
 *   { userId, sessionId, session, orgId, orgRole, ... }
 *
 * We also set req.user = { userId } for backward compatibility
 * with controllers that use req.user.userId.
 *
 * Usage:
 *   router.get('/profile', protect, userController.getProfile)
 */

const { requireAuth, getAuth } = require('@clerk/express');

/**
 * Protects routes that require authentication.
 * Sends 401 if no valid Clerk session exists.
 * Also sets req.user.userId for controller compatibility.
 */
const protect = [
  requireAuth,
  (req, res, next) => {
    const { userId } = getAuth(req);
    req.user = { userId };
    next();
  },
];

/**
 * Role-based access control middleware (placeholder for future use).
 * Clerk manages roles via orgs — extend when needed.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Clerk roles come from getAuth(req).orgRole
    // For now, allow all authenticated users
    next();
  };
};

module.exports = { protect, authorize };
