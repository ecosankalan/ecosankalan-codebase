/**
 * overpass.js — Build Overpass QL queries and fetch waste locations from OSM.
 *
 * Uses multiple Overpass API endpoints with retry + timeout + rate-limit handling.
 * Never cancels in-flight requests — results always resolve and get cached.
 */

/* ── Multiple Overpass endpoints for failover ──────────────────── */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const FETCH_TIMEOUT_MS = 60000; // 60s per attempt
const MAX_RETRIES = 2;

/* ── Global rate-limit cooldown ────────────────────────────────── */
let cooldownUntil = 0;

function getCooldownRemaining() {
  return Math.max(0, cooldownUntil - Date.now());
}

function setCooldown(seconds) {
  cooldownUntil = Date.now() + seconds * 1000;
}

/**
 * Build an Overpass QL query for all waste-related OSM features
 * inside the given bounding box.
 */
export function buildOverpassQuery(bounds) {
  const { south, west, north, east } = bounds;
  const bbox = `${south},${west},${north},${east}`;

  return `
[out:json][timeout:25][maxsize:1048576];
(
  node["amenity"="waste_basket"](${bbox});
  way["amenity"="waste_basket"](${bbox});
  relation["amenity"="waste_basket"](${bbox});

  node["amenity"="recycling"](${bbox});
  way["amenity"="recycling"](${bbox});
  relation["amenity"="recycling"](${bbox});

  node["amenity"="waste_disposal"](${bbox});
  way["amenity"="waste_disposal"](${bbox});
  relation["amenity"="waste_disposal"](${bbox});

  node["amenity"="waste_transfer_station"](${bbox});
  way["amenity"="waste_transfer_station"](${bbox});
  relation["amenity"="waste_transfer_station"](${bbox});

  node["amenity"="recycling_centre"](${bbox});
  way["amenity"="recycling_centre"](${bbox});
  relation["amenity"="recycling_centre"](${bbox});

  node["landuse"="landfill"](${bbox});
  way["landuse"="landfill"](${bbox});
  relation["landuse"="landfill"](${bbox});

  node["man_made"="wastewater_plant"](${bbox});
  way["man_made"="wastewater_plant"](${bbox});
  relation["man_made"="wastewater_plant"](${bbox});
);

out center;
`.trim();
}

/**
 * Fetch with a timeout — uses its own internal AbortController only.
 * Returns { ok, status, headers, json(), text() } or throws on timeout.
 */
function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      return res;
    })
    .catch(err => {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Timeout after ${Math.round(timeoutMs / 1000)}s`);
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }
      throw err;
    });
}

/**
 * Parse Retry-After header (seconds or HTTP-date).
 */
function parseRetryAfter(header) {
  if (!header) return 0;
  const num = Number(header);
  if (Number.isFinite(num) && num > 0) return num;
  const date = new Date(header);
  if (!Number.isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
  }
  return 0;
}

/**
 * Fetch waste locations from the Overpass API for the given bounds.
 * Handles 429 rate limits with exponential backoff and global cooldown.
 * Always resolves or rejects — never cancelled externally.
 */
export async function fetchWasteLocations(bounds) {
  const cooldownLeft = getCooldownRemaining();
  if (cooldownLeft > 0) {
    await new Promise(r => setTimeout(r, cooldownLeft));
  }

  const query = buildOverpassQuery(bounds);
  const body = new URLSearchParams({ data: query }).toString();

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];

    try {
      const res = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
        FETCH_TIMEOUT_MS,
      );

      if (res.status === 429) {
        const retryAfter = parseRetryAfter(res.headers.get('Retry-After'));
        const backoff = Math.max(retryAfter, 5 * (attempt + 1));
        console.warn(`Overpass 429 on ${endpoint}, cooling down ${backoff}s`);
        setCooldown(backoff);

        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, backoff * 1000));
          continue;
        }
        throw new Error(`Rate limited by Overpass API. Try again in ${backoff}s.`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      return res.json();
    } catch (err) {
      lastError = err;
      if (err.message.startsWith('Rate limited')) throw err;

      // Timeouts are not retryable — fail immediately, don't waste time on other endpoints
      if (err.isTimeout) {
        console.warn(`Overpass timeout on ${endpoint} after ${FETCH_TIMEOUT_MS / 1000}s`);
        throw new Error(`Overpass API timed out. It may be overloaded — try again later.`);
      }

      console.warn(
        `Overpass attempt ${attempt + 1}/${MAX_RETRIES + 1} failed (${endpoint}):`,
        err.message,
      );

      if (attempt < MAX_RETRIES) {
        const delay = 3000 * (attempt + 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw new Error(
    `Overpass API unavailable after ${MAX_RETRIES + 1} attempts. ${lastError?.message || ''}`,
  );
}
