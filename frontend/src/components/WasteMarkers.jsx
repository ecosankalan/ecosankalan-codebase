import { useEffect, useRef, useCallback, useState } from 'react';
import 'leaflet.markercluster';
import { getMapMarkers } from '../services/api';

/* ── Marker palette: color + Material Symbol icon per category ──── */
const CATEGORY_META = {
  waste_basket:           { label: 'Waste Baskets',      color: '#005127', icon: 'delete',           bgColor: '#e8f5e9' },
  recycling:              { label: 'Recycling Bins',     color: '#1565C0', icon: 'recycling',        bgColor: '#e3f2fd' },
  recycling_centre:       { label: 'Recycling Centres',  color: '#7B1FA2', icon: 'recycling',        bgColor: '#f3e5f5' },
  waste_transfer_station: { label: 'Transfer Stations',  color: '#E65100', icon: 'local_shipping',   bgColor: '#fff3e0' },
  landfill:               { label: 'Landfills',          color: '#B71C1C', icon: 'terrain',          bgColor: '#ffebee' },
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
  return CATEGORY_META[filterKey] || { label: 'Other', color: '#546E7A', icon: 'help', bgColor: '#eceff1' };
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

function buildPopupHTML(loc, filterKey) {
  const meta = getMeta(filterKey);
  const name = loc.name || loc.category;
  const tagRows = Object.entries(loc.tags)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `<tr><td style="color:#666;white-space:nowrap;padding:1px 6px 1px 0">${k}</td><td style="padding:1px 0">${v}</td></tr>`)
    .join('');

  return `
    <div style="font-family:Inter,sans-serif;min-width:180px;max-width:280px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:${meta.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span class="material-symbols-outlined" style="font-size:16px;color:#fff;font-variation-settings:'FILL' 1">${meta.icon}</span>
        </div>
        <div>
          <div style="font-weight:700;font-size:0.95rem;line-height:1.2">${name}</div>
          <div style="font-size:0.7rem;color:${meta.color};font-weight:600;text-transform:uppercase;letter-spacing:0.05em">${loc.category}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:#888;margin-bottom:4px">
        OSM ID: ${loc.osmId} &middot; ${loc.type}<br/>
        ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}
      </div>
      ${tagRows ? `<div style="max-height:120px;overflow-y:auto;margin-top:6px;border-top:1px solid #eee;padding-top:4px"><table style="font-size:0.7rem;border-collapse:collapse;width:100%">${tagRows}</table></div>` : ''}
    </div>
  `;
}

export default function WasteMarkers({ map, onMarkerClick }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [chipState, setChipState] = useState(DEFAULT_CATEGORIES);
  const [hasLoaded, setHasLoaded] = useState(false);

  const layerRef        = useRef(null);
  const debounceRef     = useRef(null);
  const clusterEnabled  = useRef(false);
  const categoriesRef   = useRef(DEFAULT_CATEGORIES);
  const locationsRef    = useRef([]);
  const onMarkerClickRef = useRef(onMarkerClick);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const renderMarkers = useCallback(() => {
    if (!map || !window.L) return;

    const L = window.L;
    const activeKeys = new Set(
      categoriesRef.current.filter(c => c.active).map(c => c.key)
    );

    const locations = locationsRef.current;

    if (layerRef.current) {
      layerRef.current.clearLayers();
    }

    const useCluster = locations.length > 500;
    if (useCluster && !clusterEnabled.current) {
      if (layerRef.current) map.removeLayer(layerRef.current);
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
      if (layerRef.current) map.removeLayer(layerRef.current);
      layerRef.current = L.layerGroup();
      map.addLayer(layerRef.current);
      clusterEnabled.current = false;
    } else if (!layerRef.current) {
      layerRef.current = L.layerGroup();
      map.addLayer(layerRef.current);
    }

    for (const loc of locations) {
      const filterKey = locationToFilterKey(loc);
      if (!activeKeys.has(filterKey)) continue;

      const icon = createWasteIcon(L, filterKey);
      const marker = L.marker([loc.lat, loc.lng], { icon });
      marker.bindPopup(buildPopupHTML(loc, filterKey), { maxWidth: 300 });
      marker.on('click', () => {
        if (onMarkerClickRef.current) onMarkerClickRef.current({ lat: loc.lat, lng: loc.lng, name: loc.name || loc.category, category: loc.category });
      });
      layerRef.current.addLayer(marker);
    }
  }, [map]);

  const fetchData = useCallback(async (bounds) => {
    if (!bounds) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await getMapMarkers({
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      });

      locationsRef.current = data.locations || [];
      renderMarkers();
      setHasLoaded(true);
    } catch (err) {
      console.error('[WasteMarkers] Fetch error:', err);
      setError(err.message || 'Failed to load markers');
    } finally {
      setLoading(false);
    }
  }, [renderMarkers]);

  const onMapMove = useCallback(() => {
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
    }, 500);
  }, [map, fetchData]);

  useEffect(() => {
    if (!map) return;

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
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

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
        <div className="waste-error-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
          <span>Could not load markers. </span>
          <button type="button" className="waste-retry-btn" onClick={() => {
            if (!map) return;
            const b = map.getBounds();
            fetchData({
              north: b.getNorth(), south: b.getSouth(),
              east: b.getEast(), west: b.getWest(),
            });
          }}>retry</button>
        </div>
      )}
    </div>
  );
}
