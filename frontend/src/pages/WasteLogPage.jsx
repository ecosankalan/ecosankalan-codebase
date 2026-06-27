import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import '../styles/waste.css';

const CATEGORIES = [
  { id: 'plastic',  label: 'Plastic',  icon: 'inventory_2',            bg: 'bg-secondary-container', iconColor: 'text-on-secondary-container' },
  { id: 'organic',  label: 'Organic',  icon: 'compost',                bg: 'bg-primary-container',   iconColor: 'text-on-primary-container',  fill: true },
  { id: 'ewaste',   label: 'E-waste',  icon: 'devices_other',          bg: 'bg-tertiary-fixed',      iconColor: 'text-on-tertiary-fixed-variant' },
  { id: 'metal',    label: 'Metal',    icon: 'precision_manufacturing', bg: 'bg-surface-container-highest', iconColor: 'text-on-surface-variant' },
  { id: 'paper',    label: 'Paper',    icon: 'description',            bg: 'bg-secondary-fixed',     iconColor: 'text-on-secondary-fixed-variant' },
  { id: 'other',    label: 'Other',    icon: 'pending',                bg: 'bg-surface-dim',         iconColor: 'text-on-surface' },
];

// Points per kg for each category
const PTS_MAP = { plastic: 15, organic: 18, ewaste: 25, metal: 20, paper: 10, other: 8 };

// CO2 conversion factors (kg CO2 saved per kg waste) — from research team doc
const CO2_MAP = { plastic: 2.5, organic: 0.5, ewaste: 4.0, metal: 1.8, paper: 1.2, other: 0.3 };

export default function WasteLogPage() {
  const navigate = useNavigate();
  const [selected,    setSelected]    = useState('organic');
  const [qty,         setQty]         = useState(2.5);
  const [notes,       setNotes]       = useState('');
  const [showModal,   setShowModal]   = useState(false);

  const pts = Math.round((PTS_MAP[selected] || 10) * qty);
  const co2 = ((CO2_MAP[selected] || 0.3) * qty).toFixed(2);

  const handleSubmit = () => setShowModal(true);
  const handleClose  = () => setShowModal(false);

  return (
    <div className="log-root">

      {/* Top App Bar */}
      <header className="log-header">
        <div className="log-header-left">
          <div className="log-avatar">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}>eco</span>
          </div>
          <span className="log-brand">EcoSankalan</span>
        </div>
        <button className="log-notif-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="log-main">

        <section className="log-hero">
          <h1 className="log-hero-title">Log Waste Today</h1>
          <p className="log-hero-sub">Help us track your environmental impact by recording your disposals.</p>
        </section>

        {/* AI Scan Card */}
        <section className="log-ai-card">
          <div className="log-ai-bg-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '6rem' }}>photo_camera</span>
          </div>
          <div className="log-ai-content">
            <div className="log-ai-badge">New Feature</div>
            <h2 className="log-ai-title">Instant AI Classification</h2>
            <p className="log-ai-desc">Don't know the category? Point your camera and let our AI handle the rest.</p>
            <button className="log-ai-btn" onClick={() => navigate('/scan-result', {
              state: {
                result: {
                  label: 'Plastic Bottle',
                  category: 'plastic',
                  material: 'PET Plastic (Type 1)',
                  confidence: 92,
                  icon: 'nest_eco_leaf',
                  co2: (CO2_MAP['plastic'] * 0.5).toFixed(2),
                  points: 12,
                  steps: [
                    'Rinse the bottle thoroughly to remove any liquid residue.',
                    'Compress the bottle and place it in the plastic recycling bin.',
                  ],
                }
              }
            })}>
              <span className="material-symbols-outlined">camera</span>
              Start AI Scan
            </button>
          </div>
        </section>

        {/* Category Grid */}
        <section className="log-section">
          <div className="log-section-header">
            <h3 className="log-section-title">Select Category</h3>
            <span className="log-section-tag">Manual Entry</span>
          </div>
          <div className="log-category-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`log-cat-btn${selected === cat.id ? ' selected' : ''}`} onClick={() => setSelected(cat.id)}>
                <div className={`log-cat-icon ${cat.bg}${selected === cat.id ? ' scaled' : ''}`}>
                  <span className={`material-symbols-outlined ${cat.iconColor}`} style={cat.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{cat.icon}</span>
                </div>
                <span className={`log-cat-label${selected === cat.id ? ' active' : ''}`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Quantity Slider */}
        <section className="log-qty-card">
          <div className="log-qty-header">
            <div>
              <h3 className="log-qty-title">Estimated Quantity</h3>
              <p className="log-qty-sub">Slide to specify weight</p>
            </div>
            <div className="log-qty-value">
              <span className="log-qty-num">{qty.toFixed(1)}</span>
              <span className="log-qty-unit">kg</span>
            </div>
          </div>
          <input
            className="log-slider"
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={qty}
            onChange={e => setQty(parseFloat(e.target.value))}
          />
          <div className="log-slider-labels">
            <span>0.1 kg</span><span>5.0 kg</span><span>10.0 kg</span>
          </div>
        </section>

        {/* Live CO2 preview */}
        <div className="log-co2-preview">
          <div className="log-co2-preview-item">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
            <div>
              <span className="log-co2-val">{co2} kg</span>
              <span className="log-co2-label">CO₂ Saved</span>
            </div>
          </div>
          <div className="log-co2-preview-divider" />
          <div className="log-co2-preview-item">
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>eco</span>
            <div>
              <span className="log-co2-val">+{pts} pts</span>
              <span className="log-co2-label">Eco Points</span>
            </div>
          </div>
          <div className="log-co2-preview-hint">
            Factor: {CO2_MAP[selected]} kg CO₂/kg {selected}
          </div>
        </div>

        {/* Notes */}
        <section className="log-notes-section">
          <label className="log-notes-label">Notes</label>
          <textarea
            className="log-notes-textarea"
            placeholder="Additional details (e.g. brand names, condition)..."
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </section>

        <div className="log-submit-wrap">
          <button className="log-submit-btn" onClick={handleSubmit}>
            Log Waste &amp; Earn Points
            <span className="material-symbols-outlined">auto_awesome</span>
          </button>
        </div>

      </main>

      <BottomNav />

      {/* Success Modal */}
      {showModal && (
        <div className="log-modal-overlay">
          <div className="log-modal-backdrop" onClick={handleClose} />
          <div className="log-modal-card">
            <div className="log-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>check_circle</span>
            </div>
            <h2 className="log-modal-title">Impact Logged!</h2>
            <p className="log-modal-sub">You're making a real difference today.</p>
            <div className="log-modal-stats">
              <div className="log-modal-stat">
                <span className="log-modal-stat-val primary">+{pts}</span>
                <span className="log-modal-stat-label">Points</span>
              </div>
              <div className="log-modal-stat">
                <span className="log-modal-stat-val tertiary">{co2} kg</span>
                <span className="log-modal-stat-label">CO₂ Saved</span>
              </div>
            </div>
            <p className="log-modal-co2-note">
              {CATEGORIES.find(c => c.id === selected)?.label} recycling saves {CO2_MAP[selected]} kg CO₂ per kg
            </p>
            <button className="log-modal-close-btn" onClick={handleClose}>Great, keep it up!</button>
          </div>
        </div>
      )}

    </div>
  );
}
