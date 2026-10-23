/**
 * scripts/removeCo2Fields.js
 * One-time cleanup for the CO₂ metric removal (product decision: CO₂
 * measurements were dropped as misleading across the whole app).
 *
 * The schemas no longer declare these fields, but existing documents in
 * MongoDB still carry them. This script $unsets them so stored data matches
 * the code:
 *   - wastelogs.co2Saved
 *   - users.totalCo2Saved
 *
 * Usage: node scripts/removeCo2Fields.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`✅ Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const wasteLogs = mongoose.connection.collection('wastelogs');
  const users = mongoose.connection.collection('users');

  const logsRes = await wasteLogs.updateMany(
    { co2Saved: { $exists: true } },
    { $unset: { co2Saved: '' } }
  );
  console.log(`🔧 Unset co2Saved on ${logsRes.modifiedCount} waste log(s)`);

  const usersRes = await users.updateMany(
    { totalCo2Saved: { $exists: true } },
    { $unset: { totalCo2Saved: '' } }
  );
  console.log(`🔧 Unset totalCo2Saved on ${usersRes.modifiedCount} user(s)`);

  const remainingLogs = await wasteLogs.countDocuments({ co2Saved: { $exists: true } });
  const remainingUsers = await users.countDocuments({ totalCo2Saved: { $exists: true } });
  console.log(`🔍 Remaining docs with co2Saved: ${remainingLogs}, totalCo2Saved: ${remainingUsers}`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Cleanup failed:', err.message);
  process.exit(1);
});
