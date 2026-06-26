import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import { getWasteHistory } from '../services/api';
import '../styles/waste-history.css';

const FILTER_CHIPS = ['All', 'Plastic', 'Organic', 'E-waste', 'Metal', 'Paper', 'Other'];

const ICON_MAP = {
  plastic:  { icon: 'recycling',               bg: 'var(--secondary-container)',       color: 'var(--on-secondary-container)' },
  organic:  { icon: 'compost',                 bg: 'var(--primary-container)',         color: 'var(--on-primary-container)'   },
  'e-waste':{ icon: 'devices',                 bg: 'var(--tertiary-fixed)',            color: 'var(--on-tertiary-fixed-variant)' },
  metal:    { icon: 'precision_manufacturing', bg: 'var(--surface-container-highest)', color: 'var(--on-surface-variant)' },
  paper:    { icon: 'description',             bg: 'var(--secondary-fixed)',           color: 'var(--on-secondary-fixed-variant)' },
  other:    { icon: 'pending',                 bg: 'var(--surface-dim)',               color: 'var(--on-surface)' },
};

const formatDate = (isoString) => {
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function WasteHistoryPage() {
  const navigate = useNavigate();
  const [filter,   setFilter]   = useState('All');
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const categoryParam = filter === 'All' ? undefined : filter.toLowerCase().replace('-', '-');

  const loadHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getWasteHistory({ category: categoryParam, page, limit: 20 });
      setLogs(page === 1 ? data.logs : prev => [...prev, ...data.logs]);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load waste history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalKg  = logs.reduce((s, l) => s + (l.unit === 'g' ? l.quantity / 1000 : l.quantity), 0).toFixed(1);
  const totalPts = logs.reduce((s, l) => s + (l.pointsEarned || 0), 0);

  return (
    <div className="wh-root">
      <Navbar />

      <main className="wh-main">

        {/* ── Title row */}
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

        {/* ── Summary row */}
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
            <span className="wh-summary-num">{pagination.total}</span>
            <span className="wh-summary-label">Logs</span>
          </div>
        </div>

        {/* ── Filter Chips */}
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

        {/* Error */}
        {error && (
          <div className="wh-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* ── History List */}
        <div className="wh-list">
          {loading && logs.length === 0 && (
            <div className="wh-empty">
              <span className="material-symbols-outlined wh-empty-icon" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              <p>Loading your history…</p>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="wh-empty">
              <span className="material-symbols-outlined wh-empty-icon">inbox</span>
              <p>No logs for this category yet.</p>
            </div>
          )}

          {logs.map(item => {
            const meta = ICON_MAP[item.category] ?? ICON_MAP.other;
            const qtyKg = item.unit === 'g' ? (item.quantity / 1000).toFixed(2) : item.quantity.toFixed(1);
            return (
              <div className="wh-card" key={item._id}>
                <div className="wh-card-left">
                  <div className="wh-card-icon" style={{ background: meta.bg, color: meta.color }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.icon}
                    </span>
                  </div>
                  <div className="wh-card-info">
                    <h3 className="wh-card-name">{capitalize(item.category)} Waste</h3>
                    <p className="wh-card-date">
                      <span className="material-symbols-outlined wh-date-icon">schedule</span>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="wh-card-right">
                  <div className="wh-card-weight">{qtyKg} kg</div>
                  <div className="wh-card-badges">
                    <span className="wh-pts-badge">+{item.pointsEarned} Pts</span>
                    <span className="wh-co2-badge">{item.co2Saved} kg CO₂</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {pagination.page < pagination.pages && (
            <button className="wh-load-more" onClick={() => loadHistory(pagination.page + 1)} disabled={loading}>
              {loading ? 'Loading…' : 'Load More'}
            </button>
          )}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
