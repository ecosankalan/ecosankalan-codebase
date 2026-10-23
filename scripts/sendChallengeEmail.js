/**
 * scripts/sendChallengeEmail.js
 * Broadcast a "new challenge" announcement to every user in the database.
 *
 * Usage (from the repo root):
 *   node scripts/sendChallengeEmail.js                       # dry run, newest challenge
 *   node scripts/sendChallengeEmail.js --id=<challengeId>    # pick a specific challenge
 *   node scripts/sendChallengeEmail.js --test=me@gmail.com   # one real mail, to yourself
 *   node scripts/sendChallengeEmail.js --send                # actually mail everyone
 *
 * Flags:
 *   --send            really send (without it nothing leaves the machine)
 *   --id=<mongoId>    challenge to announce (default: newest created)
 *   --test=<email>    send a single mail to this address instead of everyone
 *   --limit=<n>       only the first n users (useful for a smoke test)
 *   --verified-only   skip users who never verified their email
 *   --rps=<n>         mails per second (default 2 — Resend's free-tier limit)
 *   --preview         write the rendered HTML to the OS temp dir and exit
 *
 * Env: MONGODB_URI, RESEND_API_KEY, MAIL_FROM, MAIL_SITE_URL (optional)
 */

require('dotenv').config();

const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Challenge = require('../src/models/Challenge');
const { sendMail, isMailConfigured } = require('../src/services/mailer');
const { challengeEmail, publicSite } = require('../src/services/emailTemplates');

function arg(name, fallback = null) {
  const hit = process.argv.slice(2).find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const [, value] = hit.split('=');
  return value === undefined ? true : value;
}

const SEND = arg('send', false) === true;
const PREVIEW = arg('preview', false) === true;
const TEST_TO = arg('test', null);
const LIMIT = Number(arg('limit', 0)) || 0;
const RPS = Math.max(1, Number(arg('rps', 2)) || 2);
const VERIFIED_ONLY = arg('verified-only', false) === true;
const CHALLENGE_ID = arg('id', null);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fmt(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(d));
}

async function loadChallenge() {
  if (CHALLENGE_ID) {
    const byId = await Challenge.findById(CHALLENGE_ID).lean();
    if (!byId) throw new Error(`No challenge with _id ${CHALLENGE_ID}`);
    return byId;
  }
  const latest = await Challenge.findOne().sort({ createdAt: -1 }).lean();
  if (!latest) throw new Error('No challenges found — create one first.');
  return latest;
}

async function loadRecipients() {
  const query = {};
  if (VERIFIED_ONLY) query.isVerified = true;
  let q = User.find(query).select('name email isVerified -_id').sort({ createdAt: 1 }).lean();
  if (LIMIT) q = q.limit(LIMIT);
  return q;
}

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Mongo: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const challenge = await loadChallenge();
  const challengeUrl = `${publicSite().replace(/\/$/, '')}/weekly-challenges`;

  console.log('\n📣 Challenge');
  console.log(`   title      : ${challenge.title}`);
  console.log(`   window     : ${fmt(challenge.startDate)} → ${fmt(challenge.expiryDate)}`);
  console.log(`   points     : ${challenge.taskTemplate?.pointsConfig?.maxPoints ?? 100} max`);
  console.log(`   button url : ${challengeUrl}`);

  const previewTo = TEST_TO || 'preview@ecosankalan.in';
  const preview = challengeEmail({
    name: TEST_TO ? 'Test User' : 'Eco Warrior',
    challenge,
    joinUrl: challengeUrl,
  });

  if (PREVIEW) {
    const out = path.join(os.tmpdir(), 'challenge-email-preview.html');
    fs.writeFileSync(out, preview.html, 'utf8');
    console.log(`\n🖼  Preview written to: ${out}`);
    await mongoose.disconnect();
    return;
  }

  if (!isMailConfigured()) {
    console.warn('\n⚠️  RESEND_API_KEY not set — mails would be skipped. Add it to .env first.');
  }

  // ---- single test mail -------------------------------------------------
  if (TEST_TO) {
    console.log(`\n📧 Sending test mail to ${TEST_TO}${SEND ? '' : ' (DRY RUN — add --send)'}`);
    if (SEND) {
      const res = await sendMail({ to: TEST_TO, subject: preview.subject, html: preview.html });
      console.log(`   → ${res.id ? `sent (id ${res.id})` : 'skipped'}`);
    }
    await mongoose.disconnect();
    return;
  }

  // ---- broadcast --------------------------------------------------------
  const users = await loadRecipients();
  const recipients = users.filter((u) => u.email);
  console.log(`\n👥 Recipients: ${recipients.length}${VERIFIED_ONLY ? ' (verified only)' : ''}`);

  if (!SEND) {
    const sample = recipients.slice(0, 3).map((u) => `${u.name} <${u.email}>`);
    console.log('   sample:', sample.join(', ') || '—');
    console.log(`\n🧪 DRY RUN — nothing sent. Estimated time at ${RPS}/s: ~${Math.ceil(recipients.length / RPS)}s`);
    console.log('   Add --send to deliver, or --test=you@gmail.com for a single real mail.');
    await mongoose.disconnect();
    return;
  }

  const failed = [];
  let sent = 0;
  const startedAt = Date.now();

  for (let i = 0; i < recipients.length; i += 1) {
    const user = recipients[i];
    const mail = challengeEmail({
      name: user.name || 'Eco Warrior',
      challenge,
      joinUrl: challengeUrl,
    });

    try {
      await sendMail({ to: user.email, subject: mail.subject, html: mail.html });
      sent += 1;
    } catch (err) {
      failed.push({ email: user.email, error: err.message });
    }

    if ((i + 1) % 25 === 0 || i === recipients.length - 1) {
      console.log(`   ${i + 1}/${recipients.length} processed · sent ${sent} · failed ${failed.length}`);
    }

    await sleep(Math.ceil(1000 / RPS));
  }

  const secs = Math.round((Date.now() - startedAt) / 1000);
  console.log(`\n✅ Done in ${secs}s — sent ${sent}, failed ${failed.length}`);

  if (failed.length) {
    const out = path.join(os.tmpdir(), `challenge-mail-failures-${Date.now()}.json`);
    fs.writeFileSync(out, JSON.stringify(failed, null, 2), 'utf8');
    console.log(`   failure log: ${out}`);
  }

  await mongoose.disconnect();
  process.exit(failed.length && !sent ? 1 : 0);
})().catch(async (err) => {
  console.error('❌ Broadcast failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
