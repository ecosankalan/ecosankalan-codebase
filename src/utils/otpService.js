/**
 * utils/otpService.js
 * OTP delivery adapter.
 *
 * Brutal truth: Atishay's dedicated OTP microservice is not present in this repo,
 * so this module supports two modes:
 * 1) If `OTP_SERVICE_URL` is set, it attempts an HTTP call to that service.
 * 2) Otherwise it NO-OPs (and prints the OTP in non-test environments).
 */

const DEFAULT_TIMEOUT_MS = parseInt(process.env.OTP_SERVICE_TIMEOUT_MS || '1000', 10);

const postJson = async (url, body, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
};

exports.sendOtp = async ({ phone, otp, purpose, userId }) => {
  const serviceUrl = process.env.OTP_SERVICE_URL;

  if (!serviceUrl) {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(`[OTP][DEV] phone=${phone} purpose=${purpose} userId=${userId} otp=${otp}`);
    }
    return;
  }

  const res = await postJson(
    `${serviceUrl.replace(/\/$/, '')}/send-otp`,
    { phone, otp, purpose, userId },
    DEFAULT_TIMEOUT_MS
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OTP service failed: ${res.status} ${text}`);
  }
};
