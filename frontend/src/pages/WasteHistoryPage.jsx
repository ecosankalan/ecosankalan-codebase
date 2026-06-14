import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/waste-history.css';

const FILTER_CHIPS = ['All', 'Plastic', 'Organic', 'E-waste', 'Metal', 'Paper'];

const ICON_MAP = {
  Plastic: { icon: 'recycling',            bg: 'var(--secondary-container)',    color: 'var(--on-secondary-container)' },
  Organic: { icon: 'compost',              bg: 'var(--primary-container)',      color: 'var(--on-primary-container)'   },
  'E-waste':{ icon: 'devices',             bg: 'var(--tertiary-fixed)',         color: 'var(--on-tertiary-fixed-variant)' },
  Metal:   { icon: 'precision_manufacturing', bg: 'var(--surface-container-highest)', color: 'var(--on-surface-variant)' },
  Paper:   { icon: 'description',          bg: 'var(--secondary-fixed)',        color: 'var(--on-secondary-fixed-variant)' },
  Other:   { icon: 'pending',              bg: 'var(--surface-dim)',            color: 'var(--on-surface)' },
};

const ALL_LOGS = [
  { id: 1, type: 'Plastic',  name: 'Plastic Waste',      date: 'Today',      weight: '2.5 kg', points: 20, co2: '5 kg'   },
  { id: 2, type: 'Organic',  name: 'Organic Waste',      date: 'Yesterday',  weight: '1.2 kg', points: 8,  co2: '2 kg'   },
  { id: 3, type: 'E-waste',  name: 'Old Smartphone',     date: '2 days ago', weight: '0.5 kg', points: 12, co2: '1.5 kg' },
  { id: 4, type: 'Plastic',  name: 'PET Bottles',        date: '3 days ago', weight: '1.8 kg', points: 15, co2: '3.6 kg' },
  { id: 5, type: 'Paper',    name: 'Cardboard Boxes',    date: '4 days ago', weight: '3.0 kg', points: 10, co2: '4 kg'   },
  { id: 6, type: 'Metal',    name: 'Aluminium Cans',     date: '5 days ago', weight: '0.8 kg', points: 16, co2: '2.4 kg' },
  { id: 7, type: 'Organic',  name: 'Kitchen Compost',    date: '6 days ago', weight: '2.1 kg', points: 14, co2: '3 kg'   },
  { id: 8, type: 'E-waste',  name: 'Broken Headphones',  date: '7 days ago', weight: '0.3 kg', points: 7,  co2: '1 kg'   },
  { id: 9, type: 'Plastic',  name: 'Polythene Bags',     date: '8 days ago', weight: '0.6 kg', points: 9,  co2: '1.5 kg' },
  { id: 10,type: 'Paper',    name: 'Newspaper Bundle',   date: '9 days ago', weight: '4.0 kg', points: 12, co2: '5 kg'   },
];

export default function WasteHistoryPage() {
  const navigate    = useNavigate();
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All'
    ? ALL_LOGS
    : ALL_LOGS.filter(l => l.type === filter);

  const totalKg  = ALL_LOGS.reduce((s, l) => s + parseFloat(l.weight), 0).toFixed(1);
  const totalPts = ALL_LOGS.reduce((s, l) => s + l.points, 0);

  return (
    <div className="wh-root">
      <Navbar />

      <main className="wh-main">

        {/* ── Title row ──────────────────────────────────────── */}
        <div className="wh-title-row">
          <button className="wh-back-btn" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <span className="wh-eyebrow">Activity</span>
            <h1 className="wh-title">Waste History</h1>
          </div>
          <button className="wh-filter-btn">
            <span className="material-symbols-outlined">tune</span>
            Filters
          </button>
        </div>

        {/* ── Summary row ─────────────────────────────────────── */}
        <div className="wh-summary-row">
          <div className="wh-summary-card">
            <span className="wh-summary-num">{totalKg}</span>
            <span className="wh-summary-label">Total kg</span>
          </div>
          <div className="wh-summary-card">
            <span className="wh-summary-num">{totalPts}</span>
            <span className="wh-summary-label">Total Points</span>
          </div>
          <div className="wh-summary-card">
            <span className="wh-summary-num">{ALL_LOGS.length}</span>
            <span className="wh-summary-label">Logs</span>
          </div>
        </div>

        {/* ── Filter Chips ─────────────────────────────────────── */}
        <div className="wh-chips">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              className={`wh-chip${filter === chip ? ' active' : ''}`}
              onClick={() => setFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── History List ─────────────────────────────────────── */}
        <div className="wh-list">
          {visible.length === 0 && (
            <div className="wh-empty">
              <span className="material-symbols-outlined wh-empty-icon">inbox</span>
              <p>No logs for this category yet.</p>
            </div>
          )}
          {visible.map(item => {
            const meta = ICON_MAP[item.type] ?? ICON_MAP.Other;
            return (
              <div className="wh-card" key={item.id}>
                <div className="wh-card-left">
                  <div
                    className="wh-card-icon"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {meta.icon}
                    </span>
                  </div>
                  <div className="wh-card-info">
                    <h3 className="wh-card-name">{item.name}</h3>
                    <p className="wh-card-date">
                      <span className="material-symbols-outlined wh-date-icon">schedule</span>
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="wh-card-right">
                  <div className="wh-card-weight">{item.weight}</div>
                  <div className="wh-card-badges">
                    <span className="wh-pts-badge">+{item.points} Pts</span>
                    <span className="wh-co2-badge">{item.co2} CO₂</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
