import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { logWaste } from '../services/api';
import '../styles/scan-result.css';

// FR-06 Category Disposal Tips from research team
const DISPOSAL_TIPS = {
  plastic: 'Rinse plastic containers before disposal. Separate mixed materials (e.g. plastic with metal parts) where possible for better recycling.',
  paper:   'Keep paper clean and dry before recycling. Oily or wet paper should go to mixed waste or compost if biodegradable.',
  metal:   'Empty and rinse metal cans or containers before disposal. Wrap sharp metal items safely to prevent injury during handling.',
  ewaste:  'Never dispose of electronics, chargers, batteries, or cables in regular bins. Drop them at authorized e-waste collection or recycling centers.',
  organic: 'Place food scraps and biodegradable waste in compost or organic waste bins. Avoid mixing plastic packaging with organic waste.',
  other:   'Dispose of contaminated or mixed-material waste in general waste bins if it cannot be separated. Follow local disposal rules when unsure.',
};

const DEFAULT_RESULT = {
  label: 'Plastic Bottle',
  category: 'plastic',
  material: 'PET Plastic (Type 1)',
  confidence: 92,
  icon: 'nest_eco_leaf',
  co2: 1.25,
  points: 12,
  steps: [
    'Rinse the bottle thoroughly to remove any liquid residue.',
    'Compress the bottle and place it in the plastic recycling bin.',
  ],
};

// Normalise category key from label if not provided
function inferCategory(result) {
  let cat = 'other';
  if (result.category) {
    cat = result.category.toLowerCase().replace('-', '');
  } else {
    const label = (result.label || '').toLowerCase();
    if (label.includes('plastic'))  cat = 'plastic';
    else if (label.includes('paper') || label.includes('cardboard')) cat = 'paper';
    else if (label.includes('metal') || label.includes('can')) cat = 'metal';
    else if (label.includes('e-waste') || label.includes('electronic') || label.includes('battery')) cat = 'ewaste';
    else if (label.includes('organic') || label.includes('food')) cat = 'organic';
  }
  
  // Ensure it matches backend enum
  if (cat === 'ewaste' || cat === 'e-waste') return 'e-waste';
  const valid = ['plastic', 'paper', 'metal', 'organic', 'e-waste', 'other'];
  return valid.includes(cat) ? cat : 'other';
}

export default function ScanResultPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const result    = location.state?.result ?? DEFAULT_RESULT;

  const [submitting, setSubmitting] = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [error,      setError]      = useState('');

  const { label, material, confidence, co2, points, steps, reuseIdeas } = result;
  const category = inferCategory(result);
  const disposalTip = DISPOSAL_TIPS[category] || DISPOSAL_TIPS.other;
  const [showModal, setShowModal] = useState(false);

  const R          = 20;
  const CIRCUM     = 2 * Math.PI * R;
  const dashOffset = CIRCUM - (confidence / 100) * CIRCUM;

  const handleConfirm = async () => {
    if (confirmed) { navigate('/dashboard'); return; }
    setSubmitting(true);
    setError('');
    try {
      await logWaste({
        category: category,
        quantity: typeof co2 === 'number' ? Math.max(0.1, co2 / 1.5) : 0.5,
        unit: 'kg',
        description: `AI scan: ${label} (${material})`,
        logMethod: 'ai_scan',
      });
      setConfirmed(true);
      setShowModal(true); // Show success modal
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit    = () => navigate('/waste');

  return (
    <div className="scan-result-root">
      <Navbar />

      <main className="scan-result-main scanning-glow">

        {/* ── Result Image + Confidence ── */}
        <section className="scan-image-wrap">
          <div className="scan-image-placeholder">
            <span className="material-symbols-outlined scan-placeholder-icon" style={{ fontVariationSettings: "'FILL' 1" }}>nest_eco_leaf</span>
            <span className="scan-placeholder-label">Scanned Item</span>
          </div>
          <div className="scan-confidence-badge">
            <div className="scan-confidence-ring">
              <svg viewBox="0 0 48 48" className="scan-ring-svg">
                <circle cx="24" cy="24" r={R} fill="transparent" stroke="var(--secondary-container)" strokeWidth="4" />
                <circle cx="24" cy="24" r={R} fill="transparent" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={CIRCUM} strokeDashoffset={dashOffset} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
              </svg>
              <span className="scan-ring-pct">{confidence}%</span>
            </div>
            <div>
              <p className="scan-conf-label">Confidence</p>
              <p className="scan-conf-level">
                {confidence >= 85 ? 'High Accuracy' : confidence >= 60 ? 'Medium Accuracy' : 'Low Accuracy'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Category Identity ── */}
        <section className="scan-identity">
          <div className="scan-identity-icon-wrap">
            <span className="material-symbols-outlined scan-identity-icon" style={{ fontVariationSettings: "'FILL' 1" }}>nest_eco_leaf</span>
          </div>
          <h1 className="scan-identity-title">{label}</h1>
          <p className="scan-identity-material">Material: {material}</p>
          <button className="scan-switch-btn" onClick={handleEdit}>
            <span className="material-symbols-outlined">error</span>
            Not correct? Switch to manual entry
          </button>
        </section>

        {/* ── Disposal Tip (FR-06) ── */}
        <section className="scan-disposal-card">
          <div className="scan-disposal-header">
            <div className="scan-disposal-icon-wrap">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <h3 className="scan-disposal-title">Disposal Tip</h3>
          </div>
          {/* Category-specific tip from research team */}
          <div className="scan-disposal-tip-banner">
            <span className="material-symbols-outlined scan-tip-icon" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_objects</span>
            <p className="scan-disposal-tip-text">{disposalTip}</p>
          </div>
          {/* Disposal steps */}
          {steps && steps.length > 0 && (
            <div className="scan-disposal-steps">
              {steps.map((step, i) => (
                <div className="scan-step" key={`step-${i}`}>
                  <div className="scan-step-num">{i + 1}</div>
                  <p className="scan-step-text" dangerouslySetInnerHTML={{
                    __html: step.replace(/(plastic recycling bin|recycling bin|compost bin|e-waste facility)/gi, '<strong>$1</strong>')
                  }} />
                </div>
              ))}
            </div>
          )}

          {/* Reuse Ideas (Recycling Tips) */}
          {reuseIdeas && reuseIdeas.length > 0 && (
            <div className="scan-disposal-steps" style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-dim)', paddingTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--secondary)' }}>Recycling & Reuse Tips</h4>
              {reuseIdeas.map((idea, i) => (
                <div className="scan-step" key={`idea-${i}`}>
                  <div className="scan-step-num" style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>recycling</span>
                  </div>
                  <p className="scan-step-text">{idea}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Impact Preview ── */}
        <section className="scan-impact-grid">
          <div className="scan-impact-card">
            <span className="scan-impact-num primary">{typeof co2 === 'number' ? co2.toFixed(2) : co2}</span>
            <span className="scan-impact-label">kg CO₂ Saved</span>
          </div>
          <div className="scan-impact-card">
            <span className="scan-impact-num secondary">+{points}</span>
            <span className="scan-impact-label">Eco Points</span>
          </div>
        </section>

      </main>

      {error && (
        <div className="log-error-banner" style={{ margin: '0 1rem 0.5rem' }}>
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      <footer className="scan-result-footer">
        <button className="scan-confirm-btn" onClick={handleConfirm} disabled={submitting}>
          {submitting ? (
            <><span className="material-symbols-outlined log-spin">progress_activity</span> Logging…</>
          ) : confirmed ? (
            <><span className="material-symbols-outlined">check_circle</span> Logged! Redirecting…</>
          ) : (
            <>Confirm &amp; Log <span className="material-symbols-outlined">check_circle</span></>
          )}
        </button>
        <button className="scan-edit-btn" onClick={handleEdit}>Edit Category</button>
      </footer>
      
      {/* Success Modal */}
      {showModal && (
        <div className="log-modal-overlay">
          <div className="log-modal-backdrop" onClick={() => navigate('/dashboard')} />
          <div className="log-modal-card">
            <div className="log-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>check_circle</span>
            </div>
            <h2 className="log-modal-title">Impact Logged!</h2>
            <p className="log-modal-sub">AI successfully recorded your waste.</p>
            <div className="log-modal-stats">
              <div className="log-modal-stat">
                <span className="log-modal-stat-val primary">+{points}</span>
                <span className="log-modal-stat-label">Points</span>
              </div>
              <div className="log-modal-stat">
                <span className="log-modal-stat-val tertiary">{typeof co2 === 'number' ? co2.toFixed(2) : co2} kg</span>
                <span className="log-modal-stat-label">CO₂ Saved</span>
              </div>
            </div>
            <button className="log-modal-close-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
