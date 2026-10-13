/**
 * services/mailer.js
 * Resend-based mail sender for EcoSankalan.
 *
 * Env:
 *   RESEND_API_KEY  — re_... key from https://resend.com/api-keys
 *   MAIL_FROM       — verified sender, e.g. "EcoSankalan <hello@yourdomain.com>"
 *   MAIL_FROM_NAME  — optional display name override (default "EcoSankalan")
 *
 * Design: fails OPEN-safe — if no API key is configured, sendMail logs a
 * warning and resolves { skipped: true } instead of throwing, so auth and
 * waste-logging flows never break because mail isn't set up yet.
 */

const { Resend } = require('resend');
const logger = require('../config/logger');

let client = null;
if (process.env.RESEND_API_KEY) {
  client = new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.MAIL_FROM || 'EcoSankalan <onboarding@resend.dev>';

/**
 * Send an email.
 * @param {{ to: string|string[], subject: string, html: string, text?: string, replyTo?: string }} opts
 * @returns {Promise<{ id?: string, skipped?: boolean }>}
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to || !subject || !html) {
    throw new Error('sendMail requires to, subject and html');
  }
  if (!client) {
    logger.warn('RESEND_API_KEY not set — email skipped (to=%s, subject=%s)', to, subject);
    return { skipped: true };
  }
  const { data, error } = await client.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(text ? { text } : {}),
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) {
    logger.error('Resend send failed:', error);
    throw new Error(error.message || 'Email send failed');
  }
  logger.info(`Email sent to ${to} (id=${data?.id})`);
  return { id: data?.id };
}

const isMailConfigured = () => !!client;

module.exports = { sendMail, isMailConfigured };
