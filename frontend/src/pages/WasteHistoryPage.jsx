import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { getWasteHistory } from '../services/api';
import '../styles/waste-history.css';

const ICON_MAP = {
  plastic:  { icon: 'recycling',               bg: 'var(--secondary-container)',       color: 'var(--on-secondary-container)' },
  organic:  { icon: 'compost',                 bg: 'var(--primary-container)',         color: 'var(--on-primary-container)'   },
  'e-waste':{ icon: 'devices',                 bg: 'var(--tertiary-fixed)',            color: 'var(--on-tertiary-fixed-variant)' },
  metal:    { icon: 'precision_manufacturing', bg: 'var(--surface-container-highest)', color: 'var(--on-surface-variant)' },
  paper:    { icon: 'description',             bg: 'var(--secondary-fixed)',           color: 'var(--on-secondary-fixed-variant)' },
  other:    { icon: 'pending',                 bg: 'var(--surface-dim)',               color: 'var(--on-surface)' },
};

const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function WasteHistoryPage() {
  const navigate = useNavigate();
  const [sort,     setSort]     = useState('desc');
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedLog, setSelectedLog] = useState(null);

  const loadHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getWasteHistory({ sort, page, limit: 20 });
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
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button className="wh-filter-btn" onClick={() => setSort(s => s === 'desc' ? 'asc' : 'desc')}>
            <span className="material-symbols-outlined">{sort === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>
            {sort === 'desc' ? 'Newest' : 'Oldest'}
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
            <Loader text="Loading your history…" />
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
            const co2 = Number(item.co2Saved).toFixed(4);
            return (
              <div className="wh-card" key={item._id} onClick={() => setSelectedLog(item)} style={{ cursor: 'pointer' }}>
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
                      {formatDateTime(item.createdAt)}
                    </p>
                    {item.description && (
                      <p className="wh-card-desc">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="wh-card-right">
                  <div className="wh-card-weight">{qtyKg} kg</div>
                  <div className="wh-card-badges">
                    <span className="wh-pts-badge">+{item.pointsEarned} Pts</span>
                    <span className="wh-co2-badge">{co2} kg CO₂</span>
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

      {/* Detail Dialog */}
      {selectedLog && (
        <div className="wh-dialog-overlay" onClick={() => setSelectedLog(null)}>
          <div className="wh-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="wh-dialog-header">
              <h3>{capitalize(selectedLog.category)} Waste</h3>
              <button className="wh-dialog-close" onClick={() => setSelectedLog(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="wh-dialog-body">
              <div className="wh-dialog-row">
                <span className="wh-dialog-label">Date & Time</span>
                <span className="wh-dialog-value">{formatDateTime(selectedLog.createdAt)}</span>
              </div>
              <div className="wh-dialog-row">
                <span className="wh-dialog-label">Quantity</span>
                <span className="wh-dialog-value">{selectedLog.unit === 'g' ? (selectedLog.quantity / 1000).toFixed(2) : selectedLog.quantity.toFixed(1)} kg</span>
              </div>
              <div className="wh-dialog-row">
                <span className="wh-dialog-label">Points Earned</span>
                <span className="wh-dialog-value wh-dialog-pts">+{selectedLog.pointsEarned} pts</span>
              </div>
              <div className="wh-dialog-row">
                <span className="wh-dialog-label">CO₂ Saved</span>
                <span className="wh-dialog-value">{Number(selectedLog.co2Saved).toFixed(4)} kg</span>
              </div>
              <div className="wh-dialog-row">
                <span className="wh-dialog-label">Log Method</span>
                <span className="wh-dialog-value">{selectedLog.logMethod === 'ai_scan' ? 'AI Scan' : 'Manual'}</span>
              </div>
              {selectedLog.description && (
                <div className="wh-dialog-row">
                  <span className="wh-dialog-label">Description</span>
                  <span className="wh-dialog-value">{selectedLog.description}</span>
                </div>
              )}
              {selectedLog.aiScan && (
                <div className="wh-dialog-ai">
                  <p className="wh-dialog-ai-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>smart_toy</span>
                    AI Analysis
                  </p>
                  {selectedLog.aiScan.detectedCategory && (
                    <div className="wh-dialog-row">
                      <span className="wh-dialog-label">Detected</span>
                      <span className="wh-dialog-value">{selectedLog.aiScan.detectedCategory}</span>
                    </div>
                  )}
                  {selectedLog.aiScan.confidence != null && (
                    <div className="wh-dialog-row">
                      <span className="wh-dialog-label">Confidence</span>
                      <span className="wh-dialog-value">{(selectedLog.aiScan.confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {selectedLog.aiScan.rawResponse && (
                    <div className="wh-dialog-raw">
                      <span className="wh-dialog-label">Raw Response</span>
                      <pre className="wh-dialog-pre">{selectedLog.aiScan.rawResponse}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
