/**
 * services/routing.js
 * OpenRouteService Directions API integration.
 *
 * Calls the standard ORS JSON endpoint, decodes the polyline geometry
 * into GeoJSON coordinates for Leaflet rendering.
 */

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

/** Supported ORS travel profiles */
export const PROFILES = {
  DRIVING:   'driving-car',
  CYCLING:   'cycling-regular',
  WALKING:   'foot-walking',
  WHEELCHAIR:'wheelchair',
};

/**
 * Decode an ORS encoded polyline string into GeoJSON coordinates.
 * ORS uses Google's polyline encoding with precision 5.
 *
 * @param {string} encoded - Encoded polyline string
 * @returns {number[][]} Array of [longitude, latitude] pairs
 */
function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
}

/**
 * Fetch a route from OpenRouteService.
 *
 * @param {[number, number]} start - [lat, lng] of origin
 * @param {[number, number]} end   - [lat, lng] of destination
 * @param {string} [profile=PROFILES.DRIVING] - travel mode
 * @returns {Promise<{ geometry: object, distance: number, duration: number, summary: object }>}
 *   geometry — GeoJSON geometry object (for L.geoJSON)
 *   distance — total distance in meters
 *   duration — total duration in seconds
 */
export async function getRoute(start, end, profile = PROFILES.DRIVING) {
  const apiKey = import.meta.env.VITE_ORS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VITE_ORS_API_KEY — add it to frontend/.env');
  }

  // ORS expects [longitude, latitude] order
  const coords = [
    [start[1], start[0]],
    [end[1], end[0]],
  ];

  const url = `${ORS_BASE}/${profile}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ coordinates: coords }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || body?.error || `ORS request failed (${res.status})`;

    if (res.status === 401) throw new Error('Invalid API key — check VITE_ORS_API_KEY');
    if (res.status === 403) throw new Error('API key quota exceeded or forbidden');
    if (res.status === 404) throw new Error('No route found between these points');
    if (res.status === 429) throw new Error('Rate limited by OpenRouteService — try again later');
    if (res.status === 400) throw new Error('Invalid request — locations may be unreachable');

    throw new Error(msg);
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found between these locations');
  }

  const route = data.routes[0];
  const summary = route.summary || {};

  // Decode polyline into GeoJSON LineString geometry
  const coordinates = decodePolyline(route.geometry);
  const geometry = {
    type: 'LineString',
    coordinates,
  };

  return {
    geometry,
    distance: summary.distance || 0,
    duration: summary.duration || 0,
    summary,
  };
}

/**
 * Format raw distance (meters) to a human-readable string.
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format raw duration (seconds) to a human-readable string.
 */
export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}
