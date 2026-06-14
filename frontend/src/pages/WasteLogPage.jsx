import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanWasteImage } from '../services/api';
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

export default function WasteLogPage() {
  const navigate = useNavigate();
  const [selected,    setSelected]    = useState('organic');
  const [qty,         setQty]         = useState(2.5);
  const [notes,       setNotes]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [isScanning,  setIsScanning]  = useState(false);
  const fileInputRef  = useRef(null);

  const pts     = Math.round((PTS_MAP[selected] || 10) * qty);
  const co2     = (qty * 0.48).toFixed(1);

  const handleSubmit = () => setShowModal(true);
  const handleClose  = () => setShowModal(false);

  const handleStartScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('images', file);

      const res = await scanWasteImage(formData);
      
      if (res.data.success && res.data.parsed && res.data.parsed.reports?.length > 0) {
        const report = res.data.parsed.reports[0];
        
        // Confidence might be 0-1 scale or 0-100 scale
        const rawConf = report.confidence || 0.9;
        const confidencePct = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);

        // Map categories to points
        const catMap = {
          'E-Waste': 25,
          'Recyclable': 15,
          'Organic': 18,
          'Hazardous': 5,
        };
        const pts = catMap[report.wasteCategory] || 10;
        const co2Val = (pts * 0.02).toFixed(2);

        const formattedResult = {
          label: report.identifiedObject || report.wasteCategory,
          material: report.material,
          confidence: confidencePct,
          icon: 'nest_eco_leaf',
          co2: co2Val,
          points: pts,
          steps: report.beforeThrowing || report.specialHandling || ['Please dispose of this responsibly.'],
          reuseIdeas: report.reuseIdeas || [],
        };
        navigate('/scan-result', { state: { result: formattedResult } });
      } else {
        alert('Could not classify image. Please try again.');
      }
    } catch (err) {
      console.error('AI Scan Error:', err);
      alert('AI Scan failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsScanning(false);
      // Reset input so the same file can be picked again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="log-root">

      {/* Top App Bar */}
      <header className="log-header">
        <div className="log-header-left">
          <div className="log-avatar">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}
            >
              eco
            </span>
          </div>
          <span className="log-brand">EcoSankalan</span>
        </div>
        <button className="log-notif-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Main */}
      <main className="log-main">

        {/* Hero */}
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
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />
            <button className="log-ai-btn" onClick={handleStartScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <span className="material-symbols-outlined spin">hourglass_empty</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">camera</span>
                  Start AI Scan
                </>
              )}
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
              <button
                key={cat.id}
                className={`log-cat-btn${selected === cat.id ? ' selected' : ''}`}
                onClick={() => setSelected(cat.id)}
              >
                <div className={`log-cat-icon ${cat.bg}${selected === cat.id ? ' scaled' : ''}`}>
                  <span
                    className={`material-symbols-outlined ${cat.iconColor}`}
                    style={cat.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {cat.icon}
                  </span>
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
            <span>0.1 kg</span>
            <span>5.0 kg</span>
            <span>10.0 kg</span>
          </div>
        </section>

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

        {/* Submit */}
        <div className="log-submit-wrap">
          <button className="log-submit-btn" onClick={handleSubmit}>
            Log Waste &amp; Earn Points
            <span className="material-symbols-outlined">auto_awesome</span>
          </button>
        </div>

      </main>

      {/* Bottom Nav */}
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
                <span className="log-modal-stat-val tertiary">{co2}kg</span>
                <span className="log-modal-stat-label">CO₂ Saved</span>
              </div>
            </div>
            <button className="log-modal-close-btn" onClick={handleClose}>
              Great, keep it up!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
