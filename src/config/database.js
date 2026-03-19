/**
 * config/database.js
 * MongoDB Atlas connection using Mongoose.
 *
 * Why a separate file? So the connection logic isn't tangled inside server.js.
 * Any module that needs DB just trusts this has already run.
 *
 * DPDP Act 2023 note: MongoDB Atlas encrypts data at rest by default on M10+.
 * On the free M0 tier (Month 1-2), data is still TLS-encrypted in transit.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas.
 * Called once at server startup — not re-imported per request.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options silence deprecation warnings and tune connection pooling
      serverSelectionTimeoutMS: 5000, // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Log when connection drops (e.g. Atlas auto-pause on free tier)
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit the process — app is useless without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
