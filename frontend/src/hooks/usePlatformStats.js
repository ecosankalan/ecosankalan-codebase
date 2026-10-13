import { useEffect, useState } from 'react';
import { getPlatformStats } from '../services/api';

/**
 * usePlatformStats — REAL aggregate numbers from the backend
 * (GET /api/v1/platform/stats → MongoDB counts + aggregations).
 *
 * No invented seeds: before the first successful fetch the values are null
 * (rendered as "—"). The last successful response is cached in localStorage
 * so repeat visits paint instantly and honestly.
 */
const CACHE_KEY = 'ecosankalan_platform_stats';

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch { /* ignore */ }
  return null;
};

export default function usePlatformStats() {
  const [stats, setStats] = useState(() => readCache());
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPlatformStats()
      .then(({ data }) => {
        if (!cancelled && data?.stats) {
          setStats(data.stats);
          setLive(true);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.stats));
          } catch { /* ignore */ }
        }
      })
      .catch(() => {
        // Backend unreachable — keep cached (or null) values; hero pill
        // already reads "Join the movement" while live === false.
      });
    return () => { cancelled = true; };
  }, []);

  return { stats, live };
}

export const formatCompact = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  n = Number(n);
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${Math.round(n * 10) / 10}`;
};
