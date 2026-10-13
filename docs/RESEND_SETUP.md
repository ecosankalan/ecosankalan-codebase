# Resend setup — domain verification + mail service (step by step)

EcoSankalan sends mail through [Resend](https://resend.com) from the backend
(`src/services/mailer.js`) using branded templates (`src/services/emailTemplates.js`):
`welcomeEmail`, `verificationEmail` (OTP), `passwordResetEmail`, `rewardEmail`, `promoEmail`.

> Until you finish this setup, `sendMail()` safely **skips** (logs a warning,
> resolves `{ skipped: true }`) so auth and all other flows keep working.

## Background — how this all fits together

**What Resend is.** Resend is an email-sending API: your backend makes one HTTPS
call (`POST https://api.resend.com/emails`) and Resend delivers the message.
It replaces running your own SMTP server (no postfix, no port-25 reputation hell).

**Why domain verification exists.** Anyone can *claim* to send from
`hello@yourdomain.com`. Receivers (Gmail/Outlook) only trust you after you prove
domain ownership via DNS records:

- **SPF** (`TXT` record) — "these servers are allowed to send for my domain."
- **DKIM** (`TXT` records, signed per-mail) — cryptographic proof the mail
  wasn't tampered with in transit. This is what mostly keeps you out of spam.
- **DMARC** (`TXT` record) — your published policy for what receivers should do
  when SPF/DKIM fail (`p=none` = just report, safe starting point).

**The sender identity users see** is `MAIL_FROM` in `.env`, e.g.
`EcoSankalan <hello@mail.ecosankalan.in>`. It MUST belong to your verified
domain — Resend rejects anything else.

**Who handles what (important — don't build this twice):**

| Flow | Handled by | You do |
|---|---|---|
| Sign-up / login OTP, forgot-password, email verification links | **Appwrite natively** (Auth → Email templates in console) | Nothing in our backend — configure templates in the Appwrite console if you want branding there |
| Welcome mail on first sync | **Our backend** (`POST /api/v1/auth/sync` in `src/routes/auth.js`) | This Resend setup |
| Reward / milestone mails | **Our backend** (`rewardEmail` + `sendMail`) | Call from any controller |
| Promotional / announcement broadcasts | **Our backend** (`scripts/send-promo.js`, manual) | Run the script (see Step 7) |

## Step 0 — Prerequisites

- A domain you control (e.g. `ecosankalan.in`) with access to its DNS panel
  (Cloudflare / GoDaddy / Namecheap / Route53…).
- Access to the backend `.env` (never commit it).

## Step 1 — Create a Resend account

1. Go to https://resend.com/signup and sign up.
2. Open the dashboard → you start on the free tier (100 mails/day, enough for dev).

## Step 2 — Add and verify your domain

Your sender will be `no-reply@ecosankalan.in`, so verify the **apex domain**:

1. Dashboard → **Domains** → **Add Domain**.
2. **Name:** `ecosankalan.in`. (Seeing only *Name* + *Region* + *ID* is normal —
   those are the only fields. **Region:** leave the default sending region;
   either region delivers to India fine. Ignore *Advanced options* for now.)
3. Verifying the apex domain automatically covers **every** address on it,
   including `no-reply@ecosankalan.in` — no separate sender registration needed.
4. Resend shows **3 DNS records** to add where your domain's nameservers live
   (GoDaddy / Cloudflare / Namecheap / Hostinger…):

| Purpose | Type | Host / Name | Value |
|---|---|---|---|
| SPF (sender permission) | `TXT` | `mail` (or `@`) | `v=spf1 include:amazonses.com ~all` *(exact value shown by Resend — copy it)* |
| DKIM (signing, key 1) | `TXT` | `resend._domainkey.mail` *(copy exact host)* | long `p=MIGfMA0...` key *(copy exact value)* |
| DKIM (signing, key 2) | `TXT` | second host shown | second key value |
| DMARC (policy, optional but recommended) | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:you@yourdomain.com` |

4. Add all records in your DNS panel (Cloudflare: set them to **DNS only**,
   grey cloud — proxied/orange breaks verification).
5. Back in Resend → **Verify DNS**. Propagation can take **5 min – 24 h**.
   Status flips `Pending` → `Verified` ✅.

## Step 3 — Create an API key

1. Dashboard → **API Keys** → **Create API Key**.
2. Name: `ecosankalan-backend-prod`, Permission: **Sending access**.
3. Copy the key (`re_...`) — it is shown **once**.

## Step 4 — Configure the backend

Add to `ecosankalan-codebase/.env`:

```env
RESEND_API_KEY=re_YOUR_KEY_HERE
MAIL_FROM=EcoSankalan <no-reply@ecosankalan.in>
```

`MAIL_FROM` **must** use your verified domain (or a subdomain of it),
otherwise Resend rejects the send. For local testing only you may use
`onboarding@resend.dev`, which delivers **only to the Resend account email**.

Also see `.env.example` for the documented keys.

## Step 5 — Test

```bash
cd ecosankalan-codebase
node scripts/send-test-email.js you@example.com welcome
node scripts/send-test-email.js you@example.com otp
node scripts/send-test-email.js you@example.com reset
node scripts/send-test-email.js you@example.com reward
```

Check **Resend → Logs** for delivery status, then the inbox (and spam once —
new domains warm up; add the sender to contacts while testing).

## Step 6 — Where mails are triggered

- `POST /api/v1/auth/sync` (`src/routes/auth.js`) — welcome mail once per new
  profile (best-effort, in-memory dedupe, never blocks login).
- Import `sendMail` + a builder from `emailTemplates.js` anywhere else:

```js
const { sendMail } = require('../services/mailer');
const { rewardEmail } = require('../services/emailTemplates');

await sendMail({ to: user.email, ...rewardEmail({
  name: user.name, points: 50, reason: 'Bin report approved',
}) });
```

## Step 7 — Promotional broadcasts (manual, throttled)

Promos are **never automatic** — an admin runs the script deliberately:

```bash
# 1. Always dry-run first (lists who would receive it, sends nothing):
node scripts/send-promo.js --subject "Sunday Clean-up Drive" \
  --message "Join 200+ warriors at Lodhi Garden, 7 AM. Gloves + refreshments on us." \
  --url "https://your-app.com/community"

# 2. Send (capped at 50 recipients by default; raise with --limit 200):
node scripts/send-promo.js --send --subject "Sunday Clean-up Drive" \
  --message "Join 200+ warriors at Lodhi Garden, 7 AM. Gloves + refreshments on us." \
  --url "https://your-app.com/community"
```

The script throttles to ~1.6 mails/sec (free-tier safe), logs per-recipient
failures, and every promo carries an opt-out-by-reply footer. Keep broadcasts
rare (≤1–2/month) or spam complaints will hurt your domain reputation.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `RESEND_API_KEY not set — email skipped` | `.env` missing key or backend not restarted |
| `domain is not verified` / 403 | Finish Step 2; `MAIL_FROM` must match verified domain |
| Test mail only reaches your own inbox | You're sending from `onboarding@resend.dev` — expected; verify domain |
| Lands in spam | Add SPF+DKIM+DMARC (Step 2), warm up gradually, keep list clean |
| `rate limit` on free tier | 100/day + 2 req/sec — batch or upgrade |
