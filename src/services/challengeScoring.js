/**
 * services/challengeScoring.js
 * Time-decay scoring for daily challenge tasks.
 *
 * Each daily task opens at `unlockAt` and closes 24h later at `expiresAt`.
 * The first submitter receives `maxPoints`; the value decays linearly
 * toward `minPoints` as time passes. After the window closes, the task
 * scores zero (submission is rejected upstream regardless).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const toFinite = (n, fallback = 0) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
};

/**
 * Compute the points awarded for a single daily submission.
 *
 * @param {object} params
 * @param {number} params.maxPoints
 * @param {number} params.minPoints
 * @param {Date|string|number} params.unlockAt
 * @param {Date|string|number} params.submittedAt
 * @returns {number} integer points (0 if outside the window)
 */
function computePointsAwarded({ maxPoints, minPoints, unlockAt, submittedAt }) {
  const max = Math.max(0, toFinite(maxPoints));
  const min = Math.min(max, Math.max(0, toFinite(minPoints)));
  const unlock = unlockAt instanceof Date ? unlockAt.getTime() : new Date(unlockAt).getTime();
  const submitted = submittedAt instanceof Date ? submittedAt.getTime() : new Date(submittedAt).getTime();

  if (!Number.isFinite(unlock) || !Number.isFinite(submitted)) return 0;

  const elapsed = submitted - unlock;
  if (elapsed < 0 || elapsed >= DAY_MS) return 0;

  const ratio = 1 - elapsed / DAY_MS;
  const raw = max * ratio;
  return Math.max(min, Math.round(raw));
}

module.exports = {
  computePointsAwarded,
  DAY_MS,
};
