import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import { getUpcomingEvents, getNearbyBins } from '../services/api';
import '../styles/community.css';

export default function CommunityPage() {
  const navigate       = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [events,       setEvents]       = useState([]);
  const [bins,         setBins]         = useState([]);
  const [selected,     setSelected]     = useState(null); // selected event or bin for bottom sheet
  const [loading,      setLoading]      = useState(true);
  const [locating,     setLocating]     = useState(false);

  const filters = [
    { key: 'all',    icon: 'filter_list',    label: 'All Bins' },
    { key: 'events', icon: 'calendar_today', label: 'Events'   },
    { key: 'nearby', icon: 'near_me',        label: 'My Area'  },
  ];

  // Load upcoming events on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUpcomingEvents();
        setEvents(data);
        if (data.length > 0) {
          // Auto-select first event for bottom sheet preview
          setSelected({ type: 'event', data: data[0] });
        }
      } catch (err) {
        console.error('Failed to load events:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Locate user and fetch nearby bins
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await getNearbyBins({ lat: coords.latitude, lng: coords.longitude });
          setBins(data);
          setActiveFilter('nearby');
          if (data.length > 0) setSelected({ type: 'bin', data: data[0] });
        } catch (err) {
          console.error('Failed to load nearby bins:', err.message);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  };

  // Format event date
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Items shown in bottom sheet — events or bins based on filter
  const sheetItems = activeFilter === 'events'
    ? events.map(e => ({ type: 'event', data: e }))
    : activeFilter === 'nearby'
    ? bins.map(b => ({ type: 'bin', data: b }))
    : [...events.map(e => ({ type: 'event', data: e })), ...bins.map(b => ({ type: 'bin', data: b }))];

  // Currently shown in bottom sheet
  const sheetItem = selected || sheetItems[0] || null;

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

  return (
    <div className="community-map-root">
      {/* Glass Header */}
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

      {/* Map Canvas */}
      <main className="community-map-canvas">
        <div className="community-map-bg">
          <div className="community-map-overlay" />

          {/* Bin pins */}
          {bins.slice(0, 3).map((bin, i) => {
            const topPcts  = ['25%', '55%', '70%'];
            const leftPcts = ['30%', '65%', '22%'];
            return (
              <div key={bin._id} className="community-pin" style={{ top: topPcts[i], left: leftPcts[i] }}
                   onClick={() => setSelected({ type: 'bin', data: bin })}>
                <div className="community-pin-bubble community-pin-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                </div>
                <div className="community-pin-stem community-stem-primary" />
                <div className="community-pin-tooltip">{bin.name}</div>
              </div>
            );
          })}

          {/* Event pins */}
          {events.slice(0, 2).map((ev, i) => {
            const topPcts  = ['45%', '20%'];
            const leftPcts = ['60%', '50%'];
            return (
              <div key={ev._id} className="community-pin" style={{ top: topPcts[i], left: leftPcts[i] }}
                   onClick={() => setSelected({ type: 'event', data: ev })}>
                <div className="community-pin-bubble community-pin-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                </div>
                <div className="community-pin-stem community-stem-tertiary" />
                <div className="community-pin-tooltip community-tooltip-tertiary">{ev.title}</div>
              </div>
            );
          })}

          {/* Fallback static pins when no data */}
          {bins.length === 0 && events.length === 0 && (
            <>
              <div className="community-pin" style={{ top: '25%', left: '33%' }}>
                <div className="community-pin-bubble community-pin-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                </div>
                <div className="community-pin-stem community-stem-primary" />
                <div className="community-pin-tooltip">Dry Waste Hub</div>
              </div>
              <div className="community-pin" style={{ top: '50%', left: '66%' }}>
                <div className="community-pin-bubble community-pin-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                </div>
                <div className="community-pin-stem community-stem-tertiary" />
                <div className="community-pin-tooltip community-tooltip-tertiary">Park Clean-up</div>
              </div>
            </>
          )}
        </div>

        {/* Floating Search + Filters */}
        <div className="community-floating-top">
          <div className="community-search-bar">
            <span className="material-symbols-outlined community-search-icon">search</span>
            <input className="community-search-input" placeholder="Search eco-spots..." type="text" />
            <div className="community-search-divider" />
            <button className="community-list-btn">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>list</span>
            </button>
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

        {/* FABs */}
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

        {/* Bottom Sheet */}
        <div className="community-bottom-sheet">
          <div className="community-sheet-handle-row"><div className="community-sheet-handle" /></div>

          {loading ? (
            <div className="community-sheet-body" style={{ justifyContent: 'center', padding: '1rem' }}>
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              <span style={{ marginLeft: '0.5rem' }}>Loading nearby spots…</span>
            </div>
          ) : sheetItem ? (
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
                  {sheetItem.type === 'event'
                    ? sheetItem.data.title
                    : sheetItem.data.name}
                </h2>
                <div className="community-sheet-loc">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
                  <p>
                    {sheetItem.type === 'event'
                      ? sheetItem.data.address
                      : sheetItem.data.address}
                    {sheetItem.type === 'bin' && sheetItem.data.distanceMetres
                      ? ` • ${(sheetItem.data.distanceMetres / 1000).toFixed(1)} km away`
                      : ''}
                  </p>
                </div>
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
          ) : (
            <div className="community-sheet-body" style={{ justifyContent: 'center', padding: '1rem' }}>
              <p style={{ opacity: 0.6 }}>Tap a pin or use location to find spots near you.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
