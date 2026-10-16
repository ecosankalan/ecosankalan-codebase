/**
 * lib/geolocation.js
 * Geolocation helpers with exponential-backoff retries.
 *
 * Phone GPS often needs a few seconds (cold start, indoors, battery
 * saver). A single getCurrentPosition call with a short timeout fails
 * with TIMEOUT even though a retry seconds later would succeed — hence
 * this helper: up to `attempts` tries, each with a growing timeout, and
 * an exponential delay between tries, all inside an overall time budget.
 */

const DEFAULTS = {
  attempts: 3,
  baseTimeout: 8000, // first attempt timeout (ms)
  maxTimeout: 30000, // per-attempt timeout cap (ms)
  baseDelay: 1000, // wait before 2nd attempt (ms), doubles each retry
  maxTotalMs: 60000, // overall budget across all attempts (ms)
  enableHighAccuracy: true,
  maximumAge: 10000, // accept a fix up to 10s old — much faster indoors
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function once({ timeout, enableHighAccuracy, maximumAge, signal }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const watchOnAbort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal?.addEventListener('abort', watchOnAbort, { once: true });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        signal?.removeEventListener('abort', watchOnAbort);
        resolve(pos);
      },
      (err) => {
        signal?.removeEventListener('abort', watchOnAbort);
        reject(err);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

/**
 * Resolve the device position, retrying with exponential backoff.
 * @param {object} opts - overrides for DEFAULTS + onRetry(attempt, max, err) + signal
 * @returns {Promise<GeolocationPosition>}
 * @throws the last error (or AbortError) when attempts/budget run out
 */
export async function locateWithBackoff(opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  const startedAt = Date.now();
  let lastErr = new Error('Location unavailable. Try again.');

  for (let attempt = 1; attempt <= cfg.attempts; attempt++) {
    if (cfg.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    // Grow the per-attempt timeout exponentially, capped, and stop if the
    // remaining overall budget can't fit another attempt + delay.
    const timeout = Math.min(cfg.baseTimeout * 2 ** (attempt - 1), cfg.maxTimeout);
    if (Date.now() - startedAt + timeout > cfg.maxTotalMs && attempt > 1) break;
    try {
      return await once({
        timeout,
        enableHighAccuracy: cfg.enableHighAccuracy,
        maximumAge: cfg.maximumAge,
        signal: cfg.signal,
      });
    } catch (err) {
      lastErr = err;
      if (err?.name === 'AbortError') throw err;
      // Permission denied will never succeed on retry — fail fast.
      if (err?.code === 1) throw err;
      if (attempt < cfg.attempts) {
        cfg.onRetry?.(attempt + 1, cfg.attempts, err);
        await sleep(cfg.baseDelay * 2 ** (attempt - 1));
      }
    }
  }
  throw lastErr;
}

/** Human-friendly message for a final geolocation failure. */
export function locateErrorMessage(err, t) {
  if (!err) return '';
  if (err?.code === 1) return t ? t('map.locDenied') : 'Location access denied. Enable it in browser settings.';
  if (err?.code === 2) return t ? t('map.locUnavailable') : 'Location unavailable. Try again.';
  return t ? t('map.locTimeout') : 'Location request timed out. Try again.';
}
