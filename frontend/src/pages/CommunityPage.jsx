import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import WasteMarkers from '../components/WasteMarkers';
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
  const [mapReady,     setMapReady]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [showResults,   setShowResults]   = useState(false);

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);
  const searchTimerRef = useRef(null);
  const searchWrapRef  = useRef(null);

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

    const items = [
      ...bins.map(b  => ({ ...b,  _type: 'bin',   _lat: b.location.coordinates[1], _lng: b.location.coordinates[0] })),
      ...events.map(e => ({ ...e, _type: 'event', _lat: e.location.coordinates[1], _lng: e.location.coordinates[0] })),
    ];

    items.forEach(item => {
      const show =
        activeFilter === 'all'    ||
        (activeFilter === 'events' && item._type === 'event') ||
        (activeFilter === 'nearby' && item._type === 'bin');

      if (!show) return;

      const icon = item._type === 'bin' ? binIcon : eventIcon;
      const marker = L.marker([item._lat, item._lng], { icon })
        .addTo(map)
        .on('click', () => setSelected({ type: item._type, data: item }));

      const name = item._type === 'bin' ? item.name : item.title;
      const addr = item.address || '';
      marker.bindPopup(`
        <div class="map-popup">
          <strong>${name}</strong>
          <span class="map-popup-type">${item._type === 'bin' ? 'Bin' : 'Event'}</span>
          <p>${addr}</p>
        </div>
      `);

      markersRef.current.push({ marker, item });
    });
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
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const L   = window.L;
        const map = mapInstanceRef.current;
        if (!map || !L) { setLocating(false); return; }

        const latlng = [coords.latitude, coords.longitude];
        map.setView(latlng, 14);

        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker(latlng, { icon: createUserIcon(L) }).addTo(map);

        try {
          const { data } = await getNearbyBins({ lat: coords.latitude, lng: coords.longitude });
          setBins(data);
          setActiveFilter('nearby');
        } catch (err) {
          console.error('Failed to load nearby bins:', err.message);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

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
      <header className="community-glass-header">
        <div className="community-header-left">
          <div className="community-avatar">
            <img src="/logo.png" alt="EcoSankalan Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <h1 className="community-brand">EcoSankalan</h1>
        </div>
        <button className="community-notif-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="community-map-canvas">
        <div ref={mapRef} className="community-leaflet-map" />

        {mapReady && <WasteMarkers map={mapInstanceRef.current} />}

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
                <button type="button" className="community-search-clear" onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                </button>
              )}
              <div className="community-search-divider" />
              <button type="submit" className="community-list-btn">
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
                onClick={() => setActiveFilter(f.key)}>
                <span className="material-symbols-outlined community-chip-icon">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="community-fabs">
          <button className="community-fab-sm" onClick={handleLocate} disabled={locating}>
            <span className="material-symbols-outlined">
              {locating ? 'progress_activity' : 'my_location'}
            </span>
          </button>
          <button className="community-fab-lg">
            <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>add</span>
          </button>
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
                  <button className="community-sheet-btn-sec">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>directions</span>
                    Directions
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
      </main>

      <BottomNav />
    </div>
  );
}
