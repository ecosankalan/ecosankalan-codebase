/**
 * hooks/useRoute.js
 * React hook that manages route fetching, caching, and cancellation.
 *
 * Usage:
 *   const { route, loading, error, fetchRoute, clearRoute } = useRoute();
 *   await fetchRoute([lat, lng], [lat, lng]);
 *
 * Features:
 *  - Caches the last route — same destination skips the API call
 *  - Cancels in-flight request when a new destination is clicked
 *  - Normalizes errors into user-friendly messages
 */

import { useState, useRef, useCallback } from 'react';
import { getRoute, PROFILES } from '../services/routing';

export default function useRoute(profile = PROFILES.DRIVING) {
  const [route, setRoute]     = useState(null);   // { geometry, distance, duration, summary }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Track last requested destination for cache hits
  const lastDestRef = useRef(null);
  // AbortController for cancelling in-flight requests
  const abortRef    = useRef(null);

  /**
   * Fetch a route from user's current position to a destination.
   * @param {[number, number]} start - [lat, lng]
   * @param {[number, number]} end   - [lat, lng]
   */
  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end) return;

    // Cache check — same destination, skip request
    const destKey = `${end[0]},${end[1]}`;
    if (lastDestRef.current === destKey && route) return;

    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    lastDestRef.current = destKey;
    setLoading(true);
    setError(null);

    try {
      const result = await getRoute(start, end, profile);
      // Only update state if this request wasn't cancelled
      if (!controller.signal.aborted) {
        setRoute(result);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message || 'Failed to calculate route');
        setRoute(null);
        lastDestRef.current = null;
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [profile, route]);

  /** Clear the current route and reset state */
  const clearRoute = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setRoute(null);
    setLoading(false);
    setError(null);
    lastDestRef.current = null;
  }, []);

  return { route, loading, error, fetchRoute, clearRoute };
}
