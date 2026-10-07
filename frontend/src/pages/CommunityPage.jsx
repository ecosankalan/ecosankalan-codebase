import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import WasteMarkers from '../components/WasteMarkers';
import AddBinModal from '../components/AddBinModal';
import RouteLayer from '../components/RouteLayer';
import RouteInfo from '../components/RouteInfo';
import useRoute from '../hooks/useRoute';
import { searchPlaces } from '../lib/geocode';
import { getUpcomingEvents, getNearbyBins } from '../services/api';
import '../styles/community.css';

const DEFAULT_CENTER = [22.5, 79.0]; // Central India
const DEFAULT_ZOOM = 5;

function createBinIcon(L) {
  return L.divIcon({
    className: 'custom-marker-bin',
    html: `<div class="marker-pin marker-bin"><span class="material-symbols-outlined" style="font-size:18px;color:#fff">delete</span></div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function createEventIcon(L) {
  return L.divIcon({
    className: 'custom-marker-event',
    html: `<div class="marker-pin marker-event"><span class="material-symbols-outlined" style="font-size:18px;color:#fff">event</span></div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function createUserIcon(L) {
  return L.divIcon({
    className: 'custom-marker-user',
    html: `<div class="marker-pin marker-user"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommunityPage() {
  const navigate       = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [events,       setEvents]       = useState([]);
  const [bins,         setBins]         = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [locating,     setLocating]     = useState(false);
  const [locError,     setLocError]     = useState('');
  const [binsError,    setBinsError]    = useState('');
  const [mapReady,     setMapReady]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [showResults,   setShowResults]   = useState(false);
  const [showAddBin,    setShowAddBin]    = useState(false);

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);
  const searchTimerRef = useRef(null);
  const searchWrapRef  = useRef(null);
  const userLocationRef = useRef(null);

  const { route, loading: routeLoading, error: routeError, fetchRoute, clearRoute } = useRoute();

  const filters = [
    { key: 'all',    icon: 'filter_list',    label: 'All Bins' },
    { key: 'events', icon: 'calendar_today', label: 'Events'   },
    { key: 'nearby', icon: 'near_me',        label: 'My Area'  },
  ];

  /* ── Search: debounced Nominatim geocoding ─────────────────────── */
  const handleSearchInput = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(val, { limit: 6 });
        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSearchSelect = useCallback((result) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([result.lat, result.lng], 14, { duration: 1 });
    setSearchQuery(result.name);
    setSearchResults([]);
    setShowResults(false);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0]);
    }
  }, [searchResults, handleSearchSelect]);

  /* ── Waste marker click → fetch route from user location ──────── */
  const handleWasteMarkerClick = useCallback(async (markerData) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Ensure we have user location
    let userLoc = userLocationRef.current;
    if (!userLoc) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        userLoc = [pos.coords.latitude, pos.coords.longitude];
        userLocationRef.current = userLoc;

        // Show user marker if not already present
        const L = window.L;
        if (L && !userMarkerRef.current) {
          userMarkerRef.current = L.marker(userLoc, { icon: createUserIcon(L) }).addTo(map);
        }
      } catch {
        // If geolocation fails, try to center on the destination
        return;
      }
    }

    fetchRoute(userLoc, [markerData.lat, markerData.lng]);
  }, [fetchRoute]);

  /* ── Directions button in bottom sheet ────────────────────────── */
  const handleDirections = useCallback(() => {
    if (!selected) return;
    handleWasteMarkerClick({
      lat: selected.data._lat || selected.data.location?.coordinates?.[1],
      lng: selected.data._lng || selected.data.location?.coordinates?.[0],
      name: selected.data.name || selected.data.title,
    });
  }, [selected, handleWasteMarkerClick]);

  /* ── Close dropdown on outside click ──────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleEventClick = (event) => {
    navigate('/event-detail', { state: { event: {
      ...event,
      _id: event._id,
      title: event.title,
      category: 'Community Event',
      date: fmtDate(event.eventDate),
      dateFull: new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: new Date(event.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      location: event.address,
      distance: '',
      points: event.bonusPoints || 50,
      attendees: event.rsvpCount || 0,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlFAjqzzjPf8Laz0o9HntXHV2ygQelpR8-dqZ0QFuuWRLMEEFX1dnnww_AFuLoBHKeZ_j2tbDUxAWnqQ3OjdiZUrlFebZCeCDTylvbh_6ueH7SSxLl02eXtkNdcpQ7Zh3D4_qzLEVGN-GM94FdHIbp8_bQlrQZMAFc3x6MZCGCfNGt1G0BgcE7MIXIIVvgd_Vi7K43pXlPHgxHRvXtYZcZvWeCqu_VUhO8TPnUg4rJJQwwLdywhsOHjxEYDNzHjMKOBQI9p8EYWNmx',
      about: [event.description || ''],
      organizer: event.organiser || 'EcoSankalan',
      avatars: [],
    }}});
  };

  /* ── Init Leaflet map ──────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  /* ── Add/remove markers when data or filter changes ──────────── */
  const syncMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const L   = window.L;
    if (!map || !L) return;

    markersRef.current.forEach(({ marker }) => {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    markersRef.current = [];

    const binIcon   = createBinIcon(L);
    const eventIcon = createEventIcon(L);

    if (activeFilter === 'events') {
      events.forEach(item => {
        const lat = item.location?.coordinates?.[1] || item.lat;
        const lng = item.location?.coordinates?.[0] || item.lng;
        if (!lat || !lng) return;

        const eventItem = { ...item, _type: 'event', _lat: lat, _lng: lng };
        const marker = L.marker([lat, lng], { icon: eventIcon })
          .addTo(map)
          .on('click', () => setSelected({ type: 'event', data: eventItem }));

        const name = eventItem.title;
        const addr = eventItem.address || '';
        marker.bindPopup(`
          <div class="map-popup">
            <strong>${name}</strong>
            <span class="map-popup-type">Event</span>
            <p>${addr}</p>
          </div>
        `);

        markersRef.current.push({ marker, item: eventItem });
      });
    } else if (activeFilter === 'nearby') {
      bins.forEach(item => {
        const lat = item.location?.coordinates?.[1] || item.lat;
        const lng = item.location?.coordinates?.[0] || item.lng;
        if (!lat || !lng) return;

        const binItem = { ...item, _type: 'bin', _lat: lat, _lng: lng };
        const marker = L.marker([lat, lng], { icon: binIcon })
          .addTo(map)
          .on('click', () => setSelected({ type: 'bin', data: binItem }));

        const name = binItem.name;
        const addr = binItem.address || '';
        marker.bindPopup(`
          <div class="map-popup">
            <strong>${name}</strong>
            <span class="map-popup-type">Bin</span>
            <p>${addr}</p>
          </div>
        `);

        markersRef.current.push({ marker, item: binItem });
      });
    }
  }, [bins, events, activeFilter]);

  useEffect(() => { syncMarkers(); }, [syncMarkers]);

  /* ── Load events on mount ──────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUpcomingEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Locate user & fetch nearby bins ───────────────────────────── */
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported');
      setTimeout(() => setLocError(''), 3000);
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const L   = window.L;
        const map = mapInstanceRef.current;
        if (!map || !L) { setLocating(false); return; }

        const latlng = [coords.latitude, coords.longitude];
        userLocationRef.current = latlng;
        map.setView(latlng, 14);

        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker(latlng, { icon: createUserIcon(L) }).addTo(map);

        try {
          const { data } = await getNearbyBins({ lat: coords.latitude, lng: coords.longitude });
          setBins(Array.isArray(data) ? data : []);
          setBinsError('');
          setActiveFilter('nearby');
        } catch (err) {
          setBinsError(err.message || 'Could not load nearby bins.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError('Location access denied. Enable it in browser settings.');
        else if (err.code === 2) setLocError('Location unavailable. Try again.');
        else setLocError('Location request timed out. Try again.');
        setTimeout(() => setLocError(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleFilterClick = useCallback((filterKey) => {
    setActiveFilter(filterKey);
    setSelected(null);
    if (filterKey === 'nearby') {
      handleLocate();
    }
  }, [handleLocate]);

  /* ── Fly to selected marker ────────────────────────────────────── */
  useEffect(() => {
    if (!selected || !mapInstanceRef.current) return;
    const match = markersRef.current.find(
      m => m.item._id === selected.data._id && m.item._type === selected.type
    );
    if (match) {
      mapInstanceRef.current.flyTo(
        [match.item._lat, match.item._lng],
        15,
        { duration: 0.8 }
      );
      match.marker.openPopup();
    }
  }, [selected]);

  /* ── Bottom-sheet item ──────────────────────────────────────────── */
  const sheetItem = selected || null;

  return (
    <div className="community-map-root">
      <Navbar />

      <main className="community-map-canvas">
        <div ref={mapRef} className="community-leaflet-map" />

        {mapReady && <WasteMarkers map={mapInstanceRef.current} activeFilter={activeFilter} onMarkerClick={handleWasteMarkerClick} />}
        {mapReady && <RouteLayer map={mapInstanceRef.current} geometry={route?.geometry} />}

        <div className="community-floating-top">
          <div className="community-search-wrap" ref={searchWrapRef}>
            <form className="community-search-bar" onSubmit={handleSearchSubmit}>
              <span className="material-symbols-outlined community-search-icon">
                {searching ? 'progress_activity' : 'search'}
              </span>
              <input
                className="community-search-input"
                placeholder="Search places in India..."
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searchQuery && (
                <button type="button" className="community-search-clear" aria-label="Clear search" onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                </button>
              )}
              <div className="community-search-divider" />
              <button type="submit" className="community-list-btn" aria-label="Search places">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>arrow_forward</span>
              </button>
            </form>

            {showResults && searchResults.length > 0 && (
              <div className="community-search-results">
                {searchResults.map((r, i) => (
                  <button key={i} className="community-search-result" onClick={() => handleSearchSelect(r)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>location_on</span>
                    <div className="community-search-result-text">
                      <span className="community-search-result-name">{r.name}</span>
                      <span className="community-search-result-addr">{r.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="community-chips">
            {filters.map(f => (
              <button key={f.key} className={`community-chip${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => handleFilterClick(f.key)}>
                <span className="material-symbols-outlined community-chip-icon">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="community-fabs" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {locError && (
            <div className="waste-loading-badge" role="alert" style={{ background: '#ffebee', color: '#B71C1C', whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
              <span>{locError}</span>
            </div>
          )}
          {binsError && (
            <div className="waste-loading-badge" role="alert" style={{ background: '#fff8e1', color: '#5d4037', whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span>
              <span>{binsError}</span>
              <button type="button" onClick={handleLocate} className="waste-retry-btn" aria-label="Retry loading nearby bins">Retry</button>
            </div>
          )}
          <button className="community-fab-sm" onClick={handleLocate} disabled={locating} style={{ alignSelf: 'flex-end' }} aria-label="Find bins near my location">
            <span className="material-symbols-outlined">
              {locating ? 'progress_activity' : 'my_location'}
            </span>
          </button>
          {/* Add Bin — live photo + live location report */}
          <div className="waste-loading-badge" style={{ background: '#fff8e1', color: '#5d4037', padding: '0.4rem 0.75rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.72rem', maxWidth: '220px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span>
            <span>Only report real bins — false reports lose points.</span>
          </div>
          <button
            className="community-fab-addbin"
            onClick={() => setShowAddBin(true)}
            style={{ alignSelf: 'flex-end' }}
            aria-label="Report a new bin"
          >
            <span className="material-symbols-outlined">add_location</span>
            <span>Add Bin</span>
          </button>
          {/* Marker legend */}
          <div className="waste-loading-badge" aria-label="Map legend" style={{ background: 'rgba(255,255,255,0.95)', color: '#37474f', padding: '0.5rem 0.75rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#2e7d32', display: 'inline-block' }} /> Bin</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#7b1fa2', display: 'inline-block' }} /> Event</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#1565c0', display: 'inline-block' }} /> You</span>
          </div>
        </div>

        {sheetItem && (
          <div className="community-bottom-sheet">
            <div className="community-sheet-handle-row"><div className="community-sheet-handle" /></div>

            <div className="community-sheet-body">
              <div className="community-sheet-img">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwBvFj6TbkjmDGe4BPttNBvJlnJNw_UgA4ad7bvBx5oFldKu0wTcqpYUgeBVkaKOaC1SxVVKlVJqsZ262Ki8lmtoKZsPsVziGvMuRRUq8iNy-RzRAgHAWKVdXHCBPM2M4HGI5acCFwnuGLA7vesLDSQr0MGHardgdFnyH5H6h_p-CnLncloDbwEtsid8XPEXNdRk8yWYDYTlVzU_4KTItZCRxnoTSCOiJqF2bJC9GD9HOS_9XHLCKrfh9Qeom4ECqqw4LSA6kVyrn8"
                  alt="Spot"
                />
              </div>
              <div className="community-sheet-info">
                <div className="community-sheet-toprow">
                  <span className="community-sheet-tag">
                    {sheetItem.type === 'event' ? 'Community Event' : 'Waste Bin'}
                  </span>
                  <div className="community-sheet-rating">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1rem' }}>star</span>
                    <span>4.9</span>
                  </div>
                </div>
                <h2 className="community-sheet-title">
                  {sheetItem.type === 'event' ? sheetItem.data.title : sheetItem.data.name}
                </h2>
                <div className="community-sheet-loc">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
                  <p>
                    {sheetItem.data.address}
                    {sheetItem.type === 'bin' && sheetItem.data.distanceMetres
                      ? ` \u2022 ${(sheetItem.data.distanceMetres / 1000).toFixed(1)} km away`
                      : ''}
                  </p>
                </div>
                {sheetItem.type === 'bin' && sheetItem.data.types && (
                  <div className="community-sheet-tags">
                    {sheetItem.data.types.map(t => (
                      <span key={t} className="community-sheet-badge">{t}</span>
                    ))}
                  </div>
                )}
                {sheetItem.type === 'event' && (
                  <div className="community-sheet-meta">
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>calendar_today</span>
                    <span>{fmtDate(sheetItem.data.eventDate)}</span>
                    <span className="community-sheet-meta-sep">|</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>emoji_events</span>
                    <span>{sheetItem.data.bonusPoints || 0} pts</span>
                  </div>
                )}
                <div className="community-sheet-actions">
                  <button className="community-sheet-btn-sec" onClick={handleDirections} disabled={routeLoading}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                      {routeLoading ? 'progress_activity' : 'directions'}
                    </span>
                    {routeLoading ? 'Loading...' : 'Directions'}
                  </button>
                  {sheetItem.type === 'event' ? (
                    <button className="community-sheet-btn-pri" onClick={() => handleEventClick(sheetItem.data)}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>check_circle</span>
                      RSVP
                    </button>
                  ) : (
                    <button className="community-sheet-btn-pri" onClick={() => navigate('/waste')}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>delete</span>
                      Log Waste
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <RouteInfo
          route={route}
          loading={routeLoading}
          error={routeError}
          onClose={clearRoute}
        />

        {showAddBin && (
          <AddBinModal
            onClose={() => setShowAddBin(false)}
            onSubmitted={() => handleLocate()}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
