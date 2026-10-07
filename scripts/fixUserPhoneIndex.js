/**
 * scripts/fixUserPhoneIndex.js
 * One-time repair for the E11000 phone_1 duplicate-key failure on user sync.
 *
 * Root cause: findOrCreateMongoUser used to create users with `phone: null`.
 * A sparse unique index still enforces uniqueness on explicit nulls, so the
 * second synced user failed with:
 *   E11000 duplicate key error ... index: phone_1 dup key: { phone: null }
 *
 * This script:
 *   1. Unsets `phone` on all docs where it is null (missing field is skipped
 *      by the sparse index; explicit null is not).
 *   2. Ensures phone_1 is a sparse unique index (drops + recreates legacy
 *      non-sparse variants built by older schemas).
 *
 * Usage: node scripts/fixUserPhoneIndex.js
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

  const users = mongoose.connection.collection('users');

  // 1. Remove explicit nulls — sparse indexes skip missing fields, not nulls.
  const unsetRes = await users.updateMany(
    { phone: null },
    { $unset: { phone: '' } }
  );
  console.log(`🔧 Unset phone=null on ${unsetRes.modifiedCount} user(s)`);

  // 2. Ensure phone_1 is sparse + unique.
  const indexes = await users.indexes();
  const phoneIdx = indexes.find((i) => i.name === 'phone_1');
  console.log('📇 Current phone_1 index:', JSON.stringify(phoneIdx || null));

  if (phoneIdx && !(phoneIdx.unique && phoneIdx.sparse)) {
    console.log('⚠️ phone_1 is not sparse-unique — dropping legacy index...');
    await users.dropIndex('phone_1');
  }

  const afterDrop = await users.indexes();
  if (!afterDrop.some((i) => i.name === 'phone_1')) {
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true, name: 'phone_1' });
    console.log('✅ Recreated phone_1 as sparse unique');
  } else {
    console.log('✅ phone_1 is already sparse unique — nothing to do');
  }

  const nullCount = await users.countDocuments({ phone: null });
  console.log(`🔍 Remaining docs with phone=null: ${nullCount}`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Repair failed:', err.message);
  process.exit(1);
});
