import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/scan-result.css';

// Default mock data — will be replaced with real AI result via location.state
const DEFAULT_RESULT = {
  label: 'Plastic Bottle',
  material: 'PET Plastic (Type 1)',
  confidence: 92,
  icon: 'nest_eco_leaf',
  co2: 0.05,
  points: 12,
  steps: [
    'Rinse the bottle thoroughly to remove any liquid residue.',
    'Compress the bottle and place it in the plastic recycling bin.',
  ],
};

export default function ScanResultPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const result    = location.state?.result ?? DEFAULT_RESULT;

  const { label, material, confidence, co2, points, steps } = result;

  // Progress ring math
  const R          = 20;
  const CIRCUM     = 2 * Math.PI * R;
  const dashOffset = CIRCUM - (confidence / 100) * CIRCUM;

  const handleConfirm = () => {
    // TODO: POST to /api/waste-log with result data
    navigate('/dashboard');
  };

  const handleEdit = () => {
    navigate('/waste');
  };

  return (
    <div className="scan-result-root">
      <Navbar />

      <main className="scan-result-main scanning-glow">

        {/* ── Result Image + Confidence Overlay ──────────────── */}
        <section className="scan-image-wrap">
          <div className="scan-image-placeholder">
            <span
              className="material-symbols-outlined scan-placeholder-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              nest_eco_leaf
            </span>
            <span className="scan-placeholder-label">Scanned Item</span>
          </div>

          {/* Confidence badge */}
          <div className="scan-confidence-badge">
            <div className="scan-confidence-ring">
              <svg viewBox="0 0 48 48" className="scan-ring-svg">
                <circle
                  cx="24" cy="24" r={R} fill="transparent"
                  stroke="var(--secondary-container)"
                  strokeWidth="4"
                />
                <circle
                  cx="24" cy="24" r={R} fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUM}
                  strokeDashoffset={dashOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
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

        {/* ── Category Identity ───────────────────────────────── */}
        <section className="scan-identity">
          <div className="scan-identity-icon-wrap">
            <span
              className="material-symbols-outlined scan-identity-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              nest_eco_leaf
            </span>
          </div>
          <h1 className="scan-identity-title">{label}</h1>
          <p className="scan-identity-material">Material: {material}</p>
          <button className="scan-switch-btn" onClick={handleEdit}>
            <span className="material-symbols-outlined">error</span>
            Not correct? Switch to manual entry
          </button>
        </section>

        {/* ── Disposal Instructions ───────────────────────────── */}
        <section className="scan-disposal-card">
          <div className="scan-disposal-header">
            <div className="scan-disposal-icon-wrap">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <h3 className="scan-disposal-title">Disposal Tip</h3>
          </div>
          <div className="scan-disposal-steps">
            {steps.map((step, i) => (
              <div className="scan-step" key={i}>
                <div className="scan-step-num">{i + 1}</div>
                <p
                  className="scan-step-text"
                  dangerouslySetInnerHTML={{
                    __html: step.replace(
                      /(plastic recycling bin|recycling bin|compost bin|e-waste facility)/gi,
                      '<strong>$1</strong>'
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Impact Preview ──────────────────────────────────── */}
        <section className="scan-impact-grid">
          <div className="scan-impact-card">
            <span className="scan-impact-num primary">{co2}</span>
            <span className="scan-impact-label">kg CO₂ Saved</span>
          </div>
          <div className="scan-impact-card">
            <span className="scan-impact-num secondary">+{points}</span>
            <span className="scan-impact-label">Eco Points</span>
          </div>
        </section>

      </main>

      {/* ── Sticky Bottom Actions ───────────────────────────────── */}
      <footer className="scan-result-footer">
        <button className="scan-confirm-btn" onClick={handleConfirm}>
          Confirm &amp; Log
          <span className="material-symbols-outlined">check_circle</span>
        </button>
        <button className="scan-edit-btn" onClick={handleEdit}>
          Edit Category
        </button>
      </footer>
    </div>
  );
}
