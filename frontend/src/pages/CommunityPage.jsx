import { useState } from 'react';
import BottomNav from '../components/common/BottomNav';
import '../styles/community.css';

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const filters = [
    { key: 'all',    icon: 'filter_list',    label: 'All Bins' },
    { key: 'events', icon: 'calendar_today', label: 'Events'   },
    { key: 'nearby', icon: 'near_me',        label: 'My Area'  },
  ];

  return (
    <div className="community-map-root">
      {/* Glass Header */}
      <header className="community-glass-header">
        <div className="community-header-left">
          <div className="community-avatar">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}
            >
              eco
            </span>
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

          {/* Pin 1 — Dry Waste Hub */}
          <div className="community-pin" style={{ top: '25%', left: '33%' }}>
            <div className="community-pin-bubble community-pin-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </div>
            <div className="community-pin-stem community-stem-primary" />
            <div className="community-pin-tooltip">Dry Waste Hub</div>
          </div>

          {/* Pin 2 — Park Clean-up */}
          <div className="community-pin" style={{ top: '50%', left: '66%' }}>
            <div className="community-pin-bubble community-pin-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
            </div>
            <div className="community-pin-stem community-stem-tertiary" />
            <div className="community-pin-tooltip community-tooltip-tertiary">Park Clean-up</div>
          </div>

          {/* Pin 3 — another bin */}
          <div className="community-pin" style={{ bottom: '33%', left: '25%' }}>
            <div className="community-pin-bubble community-pin-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </div>
            <div className="community-pin-stem community-stem-primary" />
          </div>
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
              <button key={f.key} className={`community-chip${activeFilter === f.key ? ' active' : ''}`} onClick={() => setActiveFilter(f.key)}>
                <span className="material-symbols-outlined community-chip-icon">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FABs */}
        <div className="community-fabs">
          <button className="community-fab-sm"><span className="material-symbols-outlined">my_location</span></button>
          <button className="community-fab-lg"><span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>add</span></button>
        </div>

        {/* Bottom Sheet */}
        <div className="community-bottom-sheet">
          <div className="community-sheet-handle-row"><div className="community-sheet-handle" /></div>
          <div className="community-sheet-body">
            <div className="community-sheet-img">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwBvFj6TbkjmDGe4BPttNBvJlnJNw_UgA4ad7bvBx5oFldKu0wTcqpYUgeBVkaKOaC1SxVVKlVJqsZ262Ki8lmtoKZsPsVziGvMuRRUq8iNy-RzRAgHAWKVdXHCBPM2M4HGI5acCFwnuGLA7vesLDSQr0MGHardgdFnyH5H6h_p-CnLncloDbwEtsid8XPEXNdRk8yWYDYTlVzU_4KTItZCRxnoTSCOiJqF2bJC9GD9HOS_9XHLCKrfh9Qeom4ECqqw4LSA6kVyrn8" alt="Spot" />
            </div>
            <div className="community-sheet-info">
              <div className="community-sheet-toprow">
                <span className="community-sheet-tag">Community Event</span>
                <div className="community-sheet-rating">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1rem' }}>star</span>
                  <span>4.9</span>
                </div>
              </div>
              <h2 className="community-sheet-title">Park Clean-up &amp; Social</h2>
              <div className="community-sheet-loc">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
                <p>Sector 5, Green Valley Gardens, Metro Hub</p>
              </div>
              <div className="community-sheet-actions">
                <button className="community-sheet-btn-sec">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>directions</span>
                  Directions
                </button>
                <button className="community-sheet-btn-pri">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>check_circle</span>
                  RSVP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
