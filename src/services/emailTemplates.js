/**
 * services/emailTemplates.js
 * Branded HTML email templates — EcoSankalan "Leaf Harvest" theme.
 *
 * Palette: #2A7C13 (primary) / #76C457 (fresh) / #FFF8CF (cream) / #FBE6C2 (sand)
 * All templates are table-based + inline CSS for maximum client compatibility
 * (Gmail, Outlook, Apple Mail). No external assets — logo is a unicode leaf
 * so mails render even with images blocked.
 */

const BRAND = 'EcoSankalan';
const ACCENT = '#2A7C13';
const FRESH = '#76C457';
const CREAM = '#FFF8CF';
const SAND = '#FBE6C2';
const INK = '#20301A';
const MUTED = '#6B7A5E';

/**
 * Public URL of the real EcoSankalan logo for mails.
 * Set MAIL_LOGO_URL in .env to your hosted file, e.g.
 *   MAIL_LOGO_URL=https://your-app-domain.com/logo-192.png
 * Falls back to CLIENT_URL + /logo-192.png when CLIENT_URL is a public
 * (non-localhost) URL. When neither is available the header renders a
 * leaf glyph instead so the mail never looks broken.
 */
function logoUrl() {
  if (process.env.MAIL_LOGO_URL) return process.env.MAIL_LOGO_URL;
  const base = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (base && !/localhost|127\.0\.0\.1/.test(base)) return `${base}/logo-192.png`;
  return '';
}

function brandMark() {
  const url = logoUrl();
  if (url) {
    return `<img src="${url}" width="72" height="72" alt="${BRAND}" style="display:block;margin:0 auto;border-radius:18px;" />`;
  }
  return `<div style="font-size:36px;line-height:1;">🌿</div>`;
}

function shell({ preheader = '', title, intro, body = '', cta = null, footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${SAND};font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SAND};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFDF2;border-radius:20px;overflow:hidden;border:1px solid #EBD3A6;">
<tr><td style="background:linear-gradient(135deg,${FRESH},${ACCENT});padding:28px 32px;text-align:center;">
${brandMark()}
<div style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-0.5px;margin-top:8px;">${BRAND}</div>
<div style="color:${CREAM};font-size:12px;letter-spacing:3px;margin-top:4px;">GO GREEN DAILY</div>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 12px;font-size:22px;color:${INK};">${title}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${MUTED};">${intro}</p>
${body}
${cta ? `<div style="text-align:center;margin:24px 0 8px;"><a href="${cta.url}" style="display:inline-block;background:linear-gradient(135deg,${FRESH},${ACCENT});color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 32px;border-radius:999px;">${cta.label}</a></div>` : ''}
</td></tr>
<tr><td style="padding:0 32px 28px;text-align:center;">
<p style="font-size:12px;color:${MUTED};line-height:1.6;margin:0;">${footerNote || `You are receiving this because you signed up for ${BRAND}.`}<br>Made with care in India</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function otpBox(otp) {
  return `<div style="text-align:center;margin:20px 0;">
<div style="display:inline-block;background:${CREAM};border:2px dashed ${ACCENT};border-radius:14px;padding:14px 36px;font-size:32px;font-weight:bold;letter-spacing:8px;color:${ACCENT};">${otp}</div>
<p style="font-size:12px;color:${MUTED};margin:10px 0 0;">Valid for 10 minutes. Never share this code.</p>
</div>`;
}

/** Welcome mail — sent once when a MongoDB profile is first created. */
function welcomeEmail({ name = 'Eco Warrior', dashboardUrl }) {
  return {
    subject: `🌿 Welcome to ${BRAND}, ${name}!`,
    html: shell({
      preheader: 'Your green journey starts now — scan, sort, earn.',
      title: `Welcome aboard, ${name}! 🎉`,
      intro: 'You just joined thousands of Eco Warriors turning everyday waste into a cleaner city. Here is how to earn your first Eco Points today:',
      body: `<ul style="font-size:14px;color:${MUTED};line-height:2;padding-left:20px;margin:0;">
<li>📷 <b>Scan</b> any waste item with AI</li>
<li>🗺️ <b>Find</b> the nearest bin on the live map</li>
<li>⭐ <b>Log</b> the drop and earn points instantly</li>
</ul>`,
      cta: dashboardUrl ? { label: 'Open My Dashboard', url: dashboardUrl } : null,
    }),
  };
}

/** Email-verification OTP mail (Appwrite custom SMTP / frontend OTP flow). */
function verificationEmail({ name = 'there', otp, verifyUrl }) {
  return {
    subject: `Your ${BRAND} verification code is ${otp}`,
    html: shell({
      preheader: `Your verification code is ${otp}. Valid for 10 minutes.`,
      title: `Verify your email, ${name} ✅`,
      intro: 'Enter this code in the app to activate your account:',
      body: otpBox(otp),
      cta: verifyUrl ? { label: 'Verify in App', url: verifyUrl } : null,
    }),
  };
}

/** Password-reset mail with a reset link. */
function passwordResetEmail({ name = 'there', resetUrl, expiresMin = 30 }) {
  return {
    subject: `Reset your ${BRAND} password`,
    html: shell({
      preheader: 'Reset your password — link expires soon.',
      title: `Reset your password, ${name} 🔑`,
      intro: `Someone requested a password reset for your account. Click below (valid for ${expiresMin} minutes). If that wasn't you, safely ignore this mail.`,
      body: '',
      cta: { label: 'Reset Password', url: resetUrl },
    }),
  };
}

/** Reward / milestone mail — e.g. bin report approved, streak milestone. */
function rewardEmail({ name = 'Eco Warrior', points, reason, vouchersUrl }) {
  return {
    subject: `⭐ +${points} Eco Points — ${reason}`,
    html: shell({
      preheader: `You earned ${points} Eco Points!`,
      title: `+${points} Eco Points! ⭐`,
      intro: `Nice work, ${name} — <b>${reason}</b>. Your green streak is growing.`,
      body: `<div style="text-align:center;margin:20px 0;"><div style="display:inline-block;background:linear-gradient(135deg,${FRESH},${ACCENT});color:#fff;font-size:28px;font-weight:bold;border-radius:16px;padding:12px 32px;">+${points}</div></div>`,
      cta: vouchersUrl ? { label: 'View Rewards', url: vouchersUrl } : null,
    }),
  };
}

/** Promotional / announcement mail — clean-up drives, new features, festivals. */
function promoEmail({ name = 'Eco Warrior', headline, message, ctaLabel = 'Open EcoSankalan', ctaUrl }) {
  return {
    subject: `🌿 ${headline}`,
    html: shell({
      preheader: headline,
      title: `${headline} 🌿`,
      intro: `Hi ${name},`,
      body: `<p style="font-size:15px;line-height:1.7;color:${MUTED};margin:0 0 8px;">${message}</p>`,
      cta: ctaUrl ? { label: ctaLabel, url: ctaUrl } : null,
      footerNote: `You get occasional updates from ${BRAND}. Reply to this mail if you'd rather not receive them.`,
    }),
  };
}

module.exports = { welcomeEmail, verificationEmail, passwordResetEmail, rewardEmail, promoEmail };
