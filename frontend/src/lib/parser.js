/**
 * parser.js — Parse raw Overpass JSON responses into WasteLocation objects.
 *
 * Handles nodes, ways, and relations. For ways/relations, uses the
 * `center` field returned by `out center;`. Deduplicates by OSM element ID.
 */

/**
 * @typedef {Object} WasteLocation
 * @property {string}  id       - Unique key: `${type}_${osmId}` (dedup key)
 * @property {number}  osmId    - OSM element ID
 * @property {string}  type     - Element type: 'node' | 'way' | 'relation'
 * @property {number}  lat      - Latitude
 * @property {number}  lng      - Longitude
 * @property {string}  category - Human-readable category label
 * @property {string}  color    - Marker color key
 * @property {string}  [name]   - Name tag if present
 * @property {Object}  tags     - All OSM tags
 */

/**
 * Map OSM tag values to our internal category and marker color.
 *
 * @param {Object} tags - OSM tags object
 * @returns {{ category: string, color: string }}
 */
function categorize(tags) {
  // Priority order: recycling_centre > recycling > waste_transfer_station >
  // waste_disposal > waste_basket > landfill > wastewater_plant

  if (tags.amenity === 'recycling_centre') {
    return { category: 'Recycling Centre', color: 'purple' };
  }

  if (tags.amenity === 'recycling') {
    // Distinguish recycling bins from centres via recycling_type tag
    if (tags.recycling_type === 'centre') {
      return { category: 'Recycling Centre', color: 'purple' };
    }
    return { category: 'Recycling Bin', color: 'blue' };
  }

  if (tags.amenity === 'waste_transfer_station') {
    return { category: 'Waste Transfer Station', color: 'orange' };
  }

  if (tags.amenity === 'waste_disposal') {
    return { category: 'Waste Disposal', color: 'orange' };
  }

  if (tags.amenity === 'waste_basket') {
    return { category: 'Waste Basket', color: 'green' };
  }

  if (tags.landuse === 'landfill') {
    return { category: 'Landfill', color: 'red' };
  }

  if (tags.man_made === 'wastewater_plant') {
    return { category: 'Wastewater Plant', color: 'red' };
  }

  return { category: 'Other', color: 'grey' };
}

/**
 * Extract coordinates from an Overpass element.
 * - node → lat/lon
 * - way/relation → center.lat/center.lon (from `out center`)
 *
 * @param {Object} element - Overpass element
 * @returns {{ lat: number, lng: number } | null}
 */
function getCoords(element) {
  if (element.type === 'node') {
    if (element.lat == null || element.lon == null) return null;
    return { lat: element.lat, lng: element.lon };
  }

  // way or relation — use center from `out center`
  if (element.center) {
    if (element.center.lat == null || element.center.lon == null) return null;
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
}

/**
 * Parse the raw Overpass JSON response into an array of WasteLocation objects.
 * Deduplicates by OSM element ID.
 *
 * @param {object} data - Raw Overpass JSON response
 * @returns {WasteLocation[]} Parsed and deduplicated waste locations
 */
export function parseOverpassResponse(data) {
  if (!data || !Array.isArray(data.elements)) {
    return [];
  }

  const seen = new Set();
  const locations = [];

  for (const element of data.elements) {
    const coords = getCoords(element);
    if (!coords) continue;

    const dedupKey = `${element.type}_${element.id}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const tags = element.tags || {};
    const { category, color } = categorize(tags);

    locations.push({
      id: dedupKey,
      osmId: element.id,
      type: element.type,
      lat: coords.lat,
      lng: coords.lng,
      category,
      color,
      name: tags.name || tags['name:en'] || null,
      tags,
    });
  }

  return locations;
}
