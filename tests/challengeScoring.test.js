const { computePointsAwarded, DAY_MS } = require('../src/services/challengeScoring');

describe('challengeScoring.computePointsAwarded', () => {
  const unlockAt = new Date('2026-06-01T00:00:00.000Z');

  test('returns maxPoints at the moment of unlock', () => {
    expect(
      computePointsAwarded({
        maxPoints: 100,
        minPoints: 10,
        unlockAt,
        submittedAt: unlockAt,
      })
    ).toBe(100);
  });

  test('returns ~half at 12h elapsed', () => {
    const submittedAt = new Date(unlockAt.getTime() + 12 * 60 * 60 * 1000);
    expect(
      computePointsAwarded({
        maxPoints: 100,
        minPoints: 10,
        unlockAt,
        submittedAt,
      })
    ).toBe(50);
  });

  test('floors at minPoints near the end of the window', () => {
    const submittedAt = new Date(unlockAt.getTime() + 23 * 60 * 60 * 1000);
    const points = computePointsAwarded({
      maxPoints: 100,
      minPoints: 10,
      unlockAt,
      submittedAt,
    });
    expect(points).toBeGreaterThanOrEqual(10);
    expect(points).toBeLessThan(100);
  });

  test('returns 0 at exactly the window boundary', () => {
    const submittedAt = new Date(unlockAt.getTime() + DAY_MS);
    expect(
      computePointsAwarded({
        maxPoints: 100,
        minPoints: 10,
        unlockAt,
        submittedAt,
      })
    ).toBe(0);
  });

  test('returns 0 for submission before unlock', () => {
    const submittedAt = new Date(unlockAt.getTime() - 1000);
    expect(
      computePointsAwarded({
        maxPoints: 100,
        minPoints: 10,
        unlockAt,
        submittedAt,
      })
    ).toBe(0);
  });

  test('returns 0 for submission after window closes', () => {
    const submittedAt = new Date(unlockAt.getTime() + DAY_MS + 60 * 60 * 1000);
    expect(
      computePointsAwarded({
        maxPoints: 100,
        minPoints: 10,
        unlockAt,
        submittedAt,
      })
    ).toBe(0);
  });

  test('respects maxPoints = 0 (no points challenge)', () => {
    expect(
      computePointsAwarded({
        maxPoints: 0,
        minPoints: 0,
        unlockAt,
        submittedAt: unlockAt,
      })
    ).toBe(0);
  });

  test('handles string dates', () => {
    const points = computePointsAwarded({
      maxPoints: 100,
      minPoints: 10,
      unlockAt: unlockAt.toISOString(),
      submittedAt: new Date(unlockAt.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    });
    expect(points).toBe(75);
  });

  test('first submitter at t=0 strictly gets more than t=12h', () => {
    const early = computePointsAwarded({
      maxPoints: 100,
      minPoints: 0,
      unlockAt,
      submittedAt: unlockAt,
    });
    const late = computePointsAwarded({
      maxPoints: 100,
      minPoints: 0,
      unlockAt,
      submittedAt: new Date(unlockAt.getTime() + 12 * 60 * 60 * 1000),
    });
    expect(early).toBeGreaterThan(late);
  });
});
