/**
 * scripts/send-promo.js
 * Manual promotional broadcast to all registered users.
 *
 * Usage:
 *   node scripts/send-promo.js --dry-run --subject "Sunday Clean-up Drive" --message "Join us..." --url "https://your-app.com/community"
 *
 * Flags:
 *   --subject "..."   mail headline (required)
 *   --message "..."   body text, one or two sentences (required)
 *   --url "..."       CTA button link (optional)
 *   --cta "..."       CTA button label (default "Open EcoSankalan")
 *   --dry-run         list recipients without sending (default ON unless --send)
 *   --send            actually send
 *   --limit N         cap recipients (default 50, safety)
 *
 * Throttled to ~2 mails/sec (Resend free-tier safe). Requires RESEND_API_KEY.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const { sendMail, isMailConfigured } = require('../src/services/mailer');
const { promoEmail } = require('../src/services/emailTemplates');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) {
      const key = cur.slice(2);
      const next = arr[i + 1];
      acc.push([key, next && !next.startsWith('--') ? next : true]);
    }
    return acc;
  }, [])
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const { subject, message, url, cta, limit = '50', send } = args;
  if (!subject || !message) {
    console.error('Usage: node scripts/send-promo.js [--send] --subject "..." --message "..." [--url ...] [--cta ...] [--limit N]');
    process.exit(1);
  }
  if (!isMailConfigured()) {
    console.error('RESEND_API_KEY is not set in .env — see docs/RESEND_SETUP.md');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const User = require('../src/models/User');
  const users = await User.find({ email: { $exists: true, $ne: '' } })
    .select('name email')
    .limit(Number(limit))
    .lean();
  console.log(`Recipients: ${users.length}${send ? '' : ' (DRY RUN — pass --send to deliver)'}`);

  let sent = 0;
  for (const u of users) {
    const mail = promoEmail({
      name: u.name || 'Eco Warrior',
      headline: subject,
      message,
      ctaLabel: cta === true ? undefined : cta,
      ctaUrl: url === true ? undefined : url,
    });
    if (send) {
      try {
        await sendMail({ to: u.email, ...mail });
        sent += 1;
      } catch (err) {
        console.error(`  ✗ ${u.email}: ${err.message}`);
      }
      await sleep(600); // ~1.6 mails/sec — stays under free-tier rate limits
    } else {
      console.log(`  • ${u.email}`);
    }
  }
  console.log(send ? `Done. Sent ${sent}/${users.length}.` : 'Dry run complete. Nothing sent.');
  await mongoose.disconnect();
})().catch((err) => { console.error('Promo failed:', err.message); process.exit(1); });
