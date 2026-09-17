/**
 * middleware/auth.js
 * Appwrite Authentication Middleware
 *
 * Verifies Appwrite JWTs sent by the frontend and resolves
 * the corresponding MongoDB User document.
 *
 * Flow:
 *   1. Extract Bearer token (Appwrite JWT) from Authorization header
 *   2. Use node-appwrite to verify the JWT via account.get()
 *   3. Find or create MongoDB User by appwriteUserId / email
 *   4. Attach req.user with MongoDB userId, role, etc.
 *
 * Usage:
 *   router.get('/protected', protect, handler)
 *   router.delete('/admin', protect, authorize('admin'), handler)
 */

const { getClient, sdk } = require('../config/appwrite');
const User = require('../models/User');

/**
 * Find or create a MongoDB User from an Appwrite identity.
 *
 * Matching strategy:
 *   1. Find by appwriteUserId (fast path — already linked)
 *   2. Find by email (existing user pre-Appwrite migration)
 *   3. Create new MongoDB User
 */
const findOrCreateMongoUser = async ({ appwriteUserId, email, name }) => {
  // 1. Try by appwriteUserId
  let user = await User.findOne({ appwriteUserId });
  if (user) return user;

  // 2. Try by email (link existing user)
  user = await User.findOne({ email });
  if (user) {
    user.appwriteUserId = appwriteUserId;
    if (name && !user.name) user.name = name;
    await user.save();
    return user;
  }

  // 3. Create new user
  user = await User.create({
    appwriteUserId,
    email,
    name: name || email.split('@')[0],
    phone: null,
    role: 'user',
    isVerified: true,
  });

  return user;
};

/**
 * Protects routes that require authentication.
 *
 * Extracts the Appwrite JWT from the Authorization header,
 * verifies it against Appwrite's servers, and attaches
 * the resolved MongoDB user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // 2. Create a per-request Appwrite client with the JWT
    const adminClient = getClient();
    const requestClient = new sdk.Client()
      .setEndpoint(adminClient.config.endpoint)
      .setProject(adminClient.config.project)
      .setJWT(token);

    const account = new sdk.Account(requestClient);

    // 3. Verify JWT by fetching the Appwrite user
    let appwriteUser;
    try {
      appwriteUser = await account.get();
    } catch (err) {
      if (err.code === 401 || err.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token.',
        });
      }
      throw err;
    }

    // 4. Resolve MongoDB user from Appwrite identity
    const mongoUser = await findOrCreateMongoUser({
      appwriteUserId: appwriteUser.$id,
      email: appwriteUser.email,
      name: appwriteUser.name,
    });

    if (!mongoUser) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // 5. Attach user to request
    req.user = {
      userId: mongoUser._id,
      email: mongoUser.email,
      role: mongoUser.role,
      appwriteUserId: appwriteUser.$id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
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
