/**
 * components/RouteInfo.jsx
 * Floating card showing distance and estimated travel time.
 *
 * Appears when a route is active, displays loading state while fetching,
 * and shows error messages if routing fails.
 */

import { formatDistance, formatDuration } from '../services/routing';

export default function RouteInfo({ route, loading, error, onClose }) {
  if (!route && !loading && !error) return null;

  return (
    <div className="route-info-card">
      {loading && (
        <div className="route-info-loading">
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <span>Calculating route...</span>
        </div>
      )}

      {error && (
        <div className="route-info-error">
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>error</span>
          <span>{error}</span>
        </div>
      )}

      {route && !loading && (
        <>
          <div className="route-info-stats">
            <div className="route-info-stat">
              <span className="material-symbols-outlined route-info-icon">straighten</span>
              <div className="route-info-stat-text">
                <span className="route-info-label">Distance</span>
                <span className="route-info-value">{formatDistance(route.distance)}</span>
              </div>
            </div>
            <div className="route-info-divider" />
            <div className="route-info-stat">
              <span className="material-symbols-outlined route-info-icon">schedule</span>
              <div className="route-info-stat-text">
                <span className="route-info-label">ETA</span>
                <span className="route-info-value">{formatDuration(route.duration)}</span>
              </div>
            </div>
          </div>
          <button className="route-info-close" onClick={onClose} aria-label="Close route">
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
          </button>
        </>
      )}
    </div>
  );
}
