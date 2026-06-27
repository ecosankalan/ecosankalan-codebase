/**
 * locationStore.js — Global deduped location store.
 *
 * Stores ALL fetched waste locations by OSM element ID, and tracks
 * which bounding boxes have been queried. When the user pans, only
 * truly new areas trigger API calls — already-fetched points are
 * never re-requested.
 */

/**
 * Round to ~0.005 degree (~500m) for bbox coverage tracking.
 * Two fetches whose bboxes overlap within this precision are
 * considered to cover the same area.
 */
function roundCoord(val) {
  return Math.round(val * 200) / 200;
}

function bboxKey(s, w, n, e) {
  return `${roundCoord(s)},${roundCoord(w)},${roundCoord(n)},${roundCoord(e)}`;
}

/**
 * Check if bbox `a` fully contains bbox `b`.
 */
function contains(a, b) {
  return b.south >= a.south && b.north <= a.north &&
         b.west  >= a.west  && b.east  <= a.east;
}

/**
 * Check if two bboxes overlap.
 */
function overlaps(a, b) {
  return !(b.south > a.north || b.north < a.south ||
           b.east  < a.west  || b.west  > a.east);
}

class LocationStore {
  constructor() {
    /** @type {Map<string, import('./parser').WasteLocation>} */
    this._locations = new Map(); // id → WasteLocation
    /** @type {Array<{ south: number, west: number, north: number, east: number, timestamp: number }>} */
    this._fetchedBboxes = [];
  }

  /**
   * Merge new locations into the store. Deduped by ID.
   * @param {import('./parser').WasteLocation[]} locations
   */
  add(locations) {
    for (const loc of locations) {
      this._locations.set(loc.id, loc);
    }
  }

  /**
   * Record that a bbox has been fetched.
   * @param {{ south: number, west: number, north: number, east: number }} bounds
   */
  markFetched(bounds) {
    // Remove any existing bboxes that are fully contained by this new one
    // (the new larger fetch supersedes smaller previous ones)
    this._fetchedBboxes = this._fetchedBboxes.filter(
      (existing) => !contains(bounds, existing)
    );
    this._fetchedBboxes.push({ ...bounds, timestamp: Date.now() });
  }

  /**
   * Check if a bbox (or a significant portion of it) has already been fetched.
   * Returns true if the new bbox is fully contained by any previously fetched area.
   *
   * @param {{ south: number, west: number, north: number, east: number }} bounds
   * @returns {boolean}
   */
  hasFetched(bounds) {
    return this._fetchedBboxes.some((fetched) => contains(fetched, bounds));
  }

  /**
   * Get all stored locations that fall within the given bounds.
   *
   * @param {{ south: number, west: number, north: number, east: number }} bounds
   * @returns {import('./parser').WasteLocation[]}
   */
  getWithin(bounds) {
    const results = [];
    for (const loc of this._locations.values()) {
      if (loc.lat >= bounds.south && loc.lat <= bounds.north &&
          loc.lng >= bounds.west  && loc.lng <= bounds.east) {
        results.push(loc);
      }
    }
    return results;
  }

  /** @returns {number} Total stored locations */
  get size() {
    return this._locations.size;
  }

  /** Clear everything. */
  clear() {
    this._locations.clear();
    this._fetchedBboxes = [];
  }
}

export const locationStore = new LocationStore();
