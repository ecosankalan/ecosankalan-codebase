import { useEffect, useRef, useCallback, useState } from 'react';
import axios from 'axios';
import 'leaflet.markercluster';
import { getMapMarkers } from '../services/api';

/* ── Marker palette: teal-ramp disciplined (icons carry the semantics) ──── */
const CATEGORY_META = {
  waste_basket:           { label: 'Waste Baskets',      color: '#2A7C13', icon: 'delete',           bgColor: '#FBE6C2' },
  recycling:              { label: 'Recycling Bins',     color: '#2A7C13', icon: 'recycling',        bgColor: '#e9f2da' },
  recycling_centre:       { label: 'Recycling Centres',  color: '#55a630', icon: 'recycling',        bgColor: '#eef3d4' },
  waste_transfer_station: { label: 'Transfer Stations',  color: '#80b918', icon: 'local_shipping',   bgColor: '#f2f7e6' },
  landfill:               { label: 'Landfills',          color: '#475569', icon: 'terrain',          bgColor: '#f1f5f9' },
};

const DEFAULT_CATEGORIES = [
  { key: 'waste_basket',          active: true },
  { key: 'recycling',             active: true },
  { key: 'recycling_centre',      active: true },
  { key: 'waste_transfer_station',active: true },
  { key: 'landfill',              active: true },
];

function locationToFilterKey(loc) {
  const cat = loc.category;
  if (cat === 'Waste Basket')           return 'waste_basket';
  if (cat === 'Recycling Bin')          return 'recycling';
  if (cat === 'Recycling Centre')       return 'recycling_centre';
  if (cat === 'Waste Transfer Station') return 'waste_transfer_station';
  if (cat === 'Waste Disposal')         return 'waste_transfer_station';
  if (cat === 'Landfill')               return 'landfill';
  if (cat === 'Wastewater Plant')       return 'landfill';
  return 'other';
}

function getMeta(filterKey) {
  return CATEGORY_META[filterKey] || { label: 'Other', color: '#55705c', icon: 'help', bgColor: '#eef4f3' };
}

function createWasteIcon(L, filterKey) {
  const meta = getMeta(filterKey);
  const html = `
    <div class="waste-pin" style="--pin-color:${meta.color}">
      <div class="waste-pin-head">
        <span class="material-symbols-outlined" style="font-size:16px;color:#fff;font-variation-settings:'FILL' 1">${meta.icon}</span>
      </div>
      <div class="waste-pin-tail"></div>
    </div>`;
  return L.divIcon({
    className: 'waste-marker-icon',
    html,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
}

/* Friendly names for OSM recycling:* material tags */
const MATERIAL_LABELS = {
  glass_bottles: 'Glass', glass: 'Glass', paper: 'Paper', cardboard: 'Cardboard',
  plastic: 'Plastic', plastic_bottles: 'Plastic', metal: 'Metal', cans: 'Cans',
  clothes: 'Clothes', shoes: 'Shoes', batteries: 'Batteries', electronics: 'Electronics',
  green_waste: 'Green waste', food_waste: 'Food waste', oil: 'Oil', books: 'Books',
};

function buildPopupHTML(loc, filterKey) {
  const meta = getMeta(filterKey);
  const tags = loc.tags || {};
  const name = loc.name || meta.label;
  const operator = tags.operator || '';
  const address = tags['addr:full']
    || [tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'], tags['addr:city']]
      .filter(Boolean).join(', ');
  const phone = tags['contact:phone'] || tags.phone || '';
  const hours = tags.opening_hours || '';
  const materials = Object.keys(tags)
    .filter((k) => k.startsWith('recycling:') && String(tags[k]).toLowerCase() === 'yes')
    .map((k) => MATERIAL_LABELS[k.replace('recycling:', '')] || k.replace('recycling:', '').replace(/_/g, ' '))
    .slice(0, 6);

  return `
    <div class="wm-popup">
      <div class="wm-popup-head">
        <div class="wm-popup-icon" style="background:${meta.color}">
          <span class="material-symbols-outlined"> ${meta.icon}</span>
        </div>
        <div class="wm-popup-titles">
          <div class="wm-popup-name">${name}</div>
          <div class="wm-popup-cat" style="color:${meta.color}">${loc.category}</div>
        </div>
      </div>
      ${operator ? `<div class="wm-popup-row"><span class="material-symbols-outlined">store</span><span>Run by <b>${operator}</b></span></div>` : ''}
      ${address ? `<div class="wm-popup-row"><span class="material-symbols-outlined">location_on</span><span>${address}</span></div>` : ''}
      ${hours ? `<div class="wm-popup-row"><span class="material-symbols-outlined">schedule</span><span>${hours}</span></div>` : ''}
      ${phone ? `<div class="wm-popup-row"><span class="material-symbols-outlined">call</span><a href="tel:${phone.replace(/\s/g, '')}">${phone}</a></div>` : ''}
      ${materials.length ? `<div class="wm-popup-mats">${materials.map((m) => `<span class="wm-popup-chip">${m}</span>`).join('')}</div>` : ''}
      <div class="wm-popup-coords">${Number(loc.lat).toFixed(5)}, ${Number(loc.lng).toFixed(5)}</div>
    </div>
  `;
}

export default function WasteMarkers({ map, activeFilter = 'all', onMarkerClick }) {
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [chipState, setChipState] = useState(DEFAULT_CATEGORIES);
  const [hasLoaded, setHasLoaded] = useState(false);

  const layerRef           = useRef(null);
  const debounceRef        = useRef(null);
  const clusterEnabled     = useRef(false);
  const categoriesRef      = useRef(DEFAULT_CATEGORIES);
  const locationsRef       = useRef([]);
  const onMarkerClickRef    = useRef(onMarkerClick);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const renderMarkers = useCallback(() => {
    if (!map || !window.L) return;

    const L = window.L;

    if (!layerRef.current) {
      layerRef.current = L.layerGroup();
      map.addLayer(layerRef.current);
    }

    layerRef.current.clearLayers();

    if (activeFilter === 'events') {
      return;
    }

    const activeKeys = new Set(
      categoriesRef.current.filter(c => c.active).map(c => c.key)
    );

    const locations = locationsRef.current;
    const useCluster = locations.length > 500;

    if (useCluster && !clusterEnabled.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="waste-cluster">${count}</div>`,
            className: 'waste-cluster-icon',
            iconSize: [36, 36],
          });
        },
      });
      map.addLayer(layerRef.current);
      clusterEnabled.current = true;
    } else if (!useCluster && clusterEnabled.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = L.layerGroup();
      map.addLayer(layerRef.current);
      clusterEnabled.current = false;
    }

    for (const loc of locations) {
      const filterKey = locationToFilterKey(loc);
      if (!activeKeys.has(filterKey)) continue;

      const icon = createWasteIcon(L, filterKey);
      const marker = L.marker([loc.lat, loc.lng], { icon });
      marker.bindPopup(buildPopupHTML(loc, filterKey), { maxWidth: 300 });
      marker.on('click', () => {
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current({
            lat: loc.lat,
            lng: loc.lng,
            name: loc.name || loc.category,
            category: loc.category,
            _lat: loc.lat,
            _lng: loc.lng,
          });
        }
      });
      layerRef.current.addLayer(marker);
    }
  }, [map, activeFilter]);

  const fetchData = useCallback(async (bounds) => {
    if (!bounds || activeFilter === 'events') {
      setLoading(false);
      return;
    }

    // Client-side guard: mirror the backend's 45° cap so a country-level
    // view (e.g. whole India at zoom 5) shows "zoom in" instantly instead
    // of firing a request that 400s and spams the console + rate limit.
    const latSpan = Math.abs(bounds.north - bounds.south);
    const lngSpan = Math.abs(bounds.east - bounds.west);
    if (latSpan > 44 || lngSpan > 44) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setLoading(false);
      setError('Bounding box too large. Zoom in.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { data } = await getMapMarkers({
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      }, { signal: controller.signal });

      if (controller.signal.aborted) return;

      locationsRef.current = data.locations || [];
      renderMarkers();
      setHasLoaded(true);
    } catch (err) {
      // Aborted by a newer pan/zoom or unmount — not an error, stay silent.
      if (
        err?.code === 'ERR_CANCELED' ||
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        axios.isCancel?.(err) ||
        /canceled|cancelled|aborted/i.test(err?.message || '')
      ) {
        return;
      }
      // "Zoom in" is an expected UX state, not an error — don't console.error it.
      if (/bounding box/i.test(err?.message || '')) {
        setError(err.message);
        return;
      }
      console.error('[WasteMarkers] Fetch error:', err);
      setError(err.message || 'Failed to load markers');
    } finally {
      if (abortControllerRef.current === controller && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [renderMarkers, activeFilter]);

  const onMapMove = useCallback(() => {
    if (activeFilter === 'events') return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!map) return;
      const b = map.getBounds();
      fetchData({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    }, 650);
  }, [map, fetchData, activeFilter]);

  useEffect(() => {
    if (!map) return;

    if (activeFilter === 'events') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setLoading(false);
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
      return;
    }

    map.on('moveend', onMapMove);
    map.on('zoomend', onMapMove);

    const b = map.getBounds();
    fetchData({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });

    return () => {
      map.off('moveend', onMapMove);
      map.off('zoomend', onMapMove);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [map, activeFilter, onMapMove, fetchData]);

  const toggleCategory = (key) => {
    setChipState(prev => {
      const next = prev.map(c => c.key === key ? { ...c, active: !c.active } : c);
      categoriesRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    renderMarkers();
  }, [chipState, renderMarkers]);

  if (activeFilter === 'events') {
    return null;
  }

  return (
    <div className="waste-markers-ui">
      {hasLoaded && (
        <div className="waste-filter-chips">
          {chipState.map(cat => {
            const meta = getMeta(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                className={`waste-chip ${cat.active ? 'active' : ''}`}
                style={cat.active ? { borderColor: meta.color, background: meta.color, color: '#fff' } : {}}
                onClick={() => toggleCategory(cat.key)}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '15px',
                  color: cat.active ? '#fff' : meta.color,
                  fontVariationSettings: "'FILL' 1",
                }}>{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="waste-loading-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <span>Loading markers...</span>
        </div>
      )}

      {!loading && error && (
        <div className="waste-error-badge" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
          {/bounding box/i.test(error) ? (
            <span>Zoom in to load markers.</span>
          ) : (
            <>
              <span>Could not load markers. </span>
              <button type="button" className="waste-retry-btn" aria-label="Retry loading markers" onClick={() => {
                if (!map) return;
                const b = map.getBounds();
                fetchData({
                  north: b.getNorth(), south: b.getSouth(),
                  east: b.getEast(), west: b.getWest(),
                });
              }}>retry</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
