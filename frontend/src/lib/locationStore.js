/**
 * locationStore.js — Global deduped location store with localStorage persistence.
 *
 * Stores ALL fetched waste locations by OSM element ID, and tracks
 * which bounding boxes have been queried. When the user pans, only
 * truly new areas trigger API calls — already-fetched points are
 * never re-requested.
 *
 * Persists to localStorage so markers survive page reloads.
 * Auto-expires data older than 24 hours.
 */

const STORAGE_KEY = 'ecosankalan_waste_locations';
const STORAGE_BBOX_KEY = 'ecosankalan_waste_bboxes';
const MAX_STORED_LOCATIONS = 10000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Round to ~0.005 degree (~500m) for bbox coverage tracking.
 */
function roundCoord(val) {
  return Math.round(val * 200) / 200;
}

/**
 * Check if bbox `a` fully contains bbox `b`.
 */
function contains(a, b) {
  return b.south >= a.south && b.north <= a.north &&
         b.west  >= a.west  && b.east  <= a.east;
}

class LocationStore {
  constructor() {
    /** @type {Map<string, import('./parser').WasteLocation>} */
    this._locations = new Map();
    /** @type {Array<{ south: number, west: number, north: number, east: number, timestamp: number }>} */
    this._fetchedBboxes = [];
    this._loadFromStorage();
  }

  /* ── localStorage persistence ──────────────────────────────── */

  _loadFromStorage() {
    try {
      const locData = localStorage.getItem(STORAGE_KEY);
      if (locData) {
        const arr = JSON.parse(locData);
        // Filter out expired entries
        const now = Date.now();
        for (const loc of arr) {
          if (loc._ts && now - loc._ts > CACHE_TTL_MS) continue;
          this._locations.set(loc.id, loc);
        }
      }

      const bboxData = localStorage.getItem(STORAGE_BBOX_KEY);
      if (bboxData) {
        const arr = JSON.parse(bboxData);
        const now = Date.now();
        this._fetchedBboxes = arr.filter(b => now - b.timestamp < CACHE_TTL_MS);
      }

      console.log('[LocationStore] Loaded from localStorage:', this._locations.size, 'locations,', this._fetchedBboxes.length, 'bboxes');
    } catch {
      // Corrupted data — start fresh
      this._locations.clear();
      this._fetchedBboxes = [];
    }
  }

  _saveToStorage() {
    try {
      // Cap to max entries — drop oldest first
      if (this._locations.size > MAX_STORED_LOCATIONS) {
        const sorted = [...this._locations.entries()]
          .sort((a, b) => (a[1]._ts || 0) - (b[1]._ts || 0));
        const toRemove = sorted.slice(0, this._locations.size - MAX_STORED_LOCATIONS);
        for (const [id] of toRemove) {
          this._locations.delete(id);
        }
      }

      const locArr = [...this._locations.values()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locArr));
      localStorage.setItem(STORAGE_BBOX_KEY, JSON.stringify(this._fetchedBboxes));
    } catch (e) {
      // localStorage full or unavailable — clear old data and retry
      console.warn('[LocationStore] localStorage save failed, clearing old data:', e.message);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_BBOX_KEY);
      } catch {}
    }
  }

  /* ── Public API ────────────────────────────────────────────── */

  /**
   * Merge new locations into the store. Deduped by ID.
   * @param {import('./parser').WasteLocation[]} locations
   */
  add(locations) {
    for (const loc of locations) {
      loc._ts = Date.now();
      this._locations.set(loc.id, loc);
    }
    this._saveToStorage();
  }

  /**
   * Record that a bbox has been fetched.
   */
  markFetched(bounds) {
    this._fetchedBboxes = this._fetchedBboxes.filter(
      (existing) => !contains(bounds, existing)
    );
    this._fetchedBboxes.push({ ...bounds, timestamp: Date.now() });
    this._saveToStorage();
  }

  /**
   * Check if a bbox has already been fetched.
   */
  hasFetched(bounds) {
    return this._fetchedBboxes.some((fetched) => contains(fetched, bounds));
  }

  /**
   * Get all stored locations within the given bounds.
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

  /** Clear everything including localStorage. */
  clear() {
    this._locations.clear();
    this._fetchedBboxes = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_BBOX_KEY);
  }
}

export const locationStore = new LocationStore();
