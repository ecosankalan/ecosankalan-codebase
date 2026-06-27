/**
 * geocode.js — Geocoding via Nominatim (OpenStreetMap).
 *
 * Provides forward geocoding (place name → coordinates)
 * using the free Nominatim API. Respects the usage policy:
 *  - Max 1 request/second
 *  - Valid User-Agent header
 *  - No heavy batching
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Search for places by name. Returns an array of results.
 *
 * @param {string} query - Place name or address to search
 * @param {object} [opts]
 * @param {number} [opts.limit=5] - Max results to return
 * @param {string} [opts.countrycodes='in'] - Comma-separated country codes to restrict search
 * @returns {Promise<Array<{ name: string, lat: number, lng: number, display_name: string, type: string, importance: number }>>}
 */
export async function searchPlaces(query, opts = {}) {
  const { limit = 5, countrycodes = 'in' } = opts;

  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: String(limit),
    countrycodes,
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status}`);
  }

  const data = await res.json();

  return data.map((item) => ({
    name: item.display_name.split(',')[0],
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    display_name: item.display_name,
    type: item.type,
    importance: item.importance,
  }));
}
