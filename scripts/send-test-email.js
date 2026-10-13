/**
 * scripts/send-test-email.js
 * Smoke-test for the Resend mail setup.
 *
 * Usage:
 *   node scripts/send-test-email.js you@example.com
 *   node scripts/send-test-email.js you@example.com welcome|otp|reset|reward
 *
 * Requires RESEND_API_KEY in ecosankalan-codebase/.env
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { sendMail, isMailConfigured } = require('../src/services/mailer');
const templates = require('../src/services/emailTemplates');

(async () => {
  const to = process.argv[2];
  const kind = (process.argv[3] || 'welcome').toLowerCase();
  if (!to) {
    console.error('Usage: node scripts/send-test-email.js <recipient-email> [welcome|otp|reset|reward]');
    process.exit(1);
  }
  if (!isMailConfigured()) {
    console.error('RESEND_API_KEY is not set in .env — see docs/RESEND_SETUP.md');
    process.exit(1);
  }
  const builders = {
    welcome: () => templates.welcomeEmail({ name: 'Test Warrior', dashboardUrl: process.env.CLIENT_URL }),
    otp: () => templates.verificationEmail({ name: 'Test Warrior', otp: '482916' }),
    reset: () => templates.passwordResetEmail({ name: 'Test Warrior', resetUrl: `${process.env.CLIENT_URL}/reset-password?token=test` }),
    reward: () => templates.rewardEmail({ name: 'Test Warrior', points: 50, reason: 'Bin report approved' }),
  };
  const build = builders[kind];
  if (!build) {
    console.error(`Unknown template "${kind}". Choose: welcome|otp|reset|reward`);
    process.exit(1);
  }
  try {
    const res = await sendMail({ to, ...build() });
    console.log(`Sent "${kind}" email to ${to} (id=${res.id})`);
  } catch (err) {
    console.error('Send failed:', err.message);
    process.exit(1);
  }
})();
