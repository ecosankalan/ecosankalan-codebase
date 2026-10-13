import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import { logWaste } from '../services/api';
import { useStats } from '../context/StatsContext';
import '../styles/scan-result.css';

// FR-06 Category Disposal Tips from research team — translated via scan.tip* keys
const DISPOSAL_TIP_KEYS = {
  plastic: 'tipPlastic',
  paper:   'tipPaper',
  metal:   'tipMetal',
  ewaste:  'tipEwaste',
  'e-waste': 'tipEwaste',
  organic: 'tipOrganic',
  other:   'tipOther',
};

function inferCategory(result) {
  const textToSearch = ((result.category || '') + ' ' + (result.label || '') + ' ' + (result.material || '')).toLowerCase();
  
  if (textToSearch.includes('plastic') || textToSearch.includes('pet') || textToSearch.includes('polyester')) return 'plastic';
  if (textToSearch.includes('paper') || textToSearch.includes('cardboard') || textToSearch.includes('carton') || textToSearch.includes('newspaper')) return 'paper';
  if (textToSearch.includes('metal') || textToSearch.includes('can') || textToSearch.includes('aluminum') || textToSearch.includes('steel') || textToSearch.includes('iron') || textToSearch.includes('tin')) return 'metal';
  if (textToSearch.includes('organic') || textToSearch.includes('food') || textToSearch.includes('compost') || textToSearch.includes('fruit') || textToSearch.includes('veg') || textToSearch.includes('leaf') || textToSearch.includes('wood') || textToSearch.includes('peel')) return 'organic';
  if (textToSearch.includes('e-waste') || textToSearch.includes('electronic') || textToSearch.includes('battery') || textToSearch.includes('cable') || textToSearch.includes('phone') || textToSearch.includes('computer') || textToSearch.includes('wire')) return 'e-waste';
  
  return 'other';
}

export default function ScanResultPage() {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { refreshAllStats } = useStats();
  const DEFAULT_RESULT = {
    label: t('scan.defaultLabel'),
    category: 'plastic',
    material: t('scan.defaultMaterial'),
    confidence: 92,
    icon: 'nest_eco_leaf',
    co2: 1.25,
    points: 12,
    steps: t('scan.defaultSteps', { returnObjects: true }),
  };
  const result    = location.state?.result ?? DEFAULT_RESULT;

  const [submitting, setSubmitting] = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [error,      setError]      = useState('');

  const { label, material, confidence, co2, points, steps, reuseIdeas, ecoLesson, binColor, category: resultCategory } = result;

  const isInvalid = resultCategory === 'Not Waste' || binColor === 'None';
  const category = inferCategory(result);
  const disposalTip = t(`scan.${DISPOSAL_TIP_KEYS[category] || 'tipOther'}`);
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
        aiScan: {
          rawResponse: result.rawResponse || result.parsed || null,
          confidence: confidence != null ? confidence / 100 : null,
          detectedCategory: result.category || result.detectedCategory || null,
        },
      });
      await refreshAllStats(); // Update global stats
      setConfirmed(true);
      setShowModal(true); // Show success modal
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('scan.logFailed'));
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
          {result.imageUrl ? (
            <img src={result.imageUrl} alt={t('scan.imgAlt')} className="scan-actual-image" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
          ) : (
            <div className="scan-image-placeholder">
              <span className="material-symbols-outlined scan-placeholder-icon" style={{ fontVariationSettings: "'FILL' 1" }}>recycling</span>
              <span className="scan-placeholder-label">{t('scan.placeholderLabel')}</span>
            </div>
          )}
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
              <p className="scan-conf-label">{t('scan.confidence')}</p>
              <p className="scan-conf-level">
                {confidence >= 85 ? t('scan.highAccuracy') : confidence >= 60 ? t('scan.mediumAccuracy') : t('scan.lowAccuracy')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Category Identity ── */}
        <section className="scan-identity">
          <div className="scan-identity-icon-wrap">
            <span className="material-symbols-outlined scan-identity-icon" style={{ fontVariationSettings: "'FILL' 1", color: binColor !== 'None' ? binColor : 'var(--primary)' }}>
              {(() => {
                switch(category) {
                  case 'plastic': return 'local_drink';
                  case 'paper': return 'article';
                  case 'metal': return 'settings';
                  case 'organic': return 'compost';
                  case 'e-waste': return 'devices';
                  case 'other': return 'inventory_2';
                  default: return 'recycling';
                }
              })()}
            </span>
          </div>
          <h1 className="scan-identity-title">{label}</h1>
          <p className="scan-identity-material">{t('scan.material', { material })}</p>
          <button className="scan-switch-btn" onClick={handleEdit}>
            <span className="material-symbols-outlined">error</span>
            {t('scan.notCorrect')}
          </button>
        </section>

        {/* ── Bin Drop Animation ── */}
        {!isInvalid ? (
          <section className="scan-bin-animation-card" style={{ background: 'var(--surface)', margin: '1rem', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--on-surface)' }}>{t('scan.guideTitle')}</h3>
            
            <div style={{ position: 'relative', height: '110px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '10px' }}>
              
              {/* Falling waste item */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: binColor?.toLowerCase() === 'blue' ? '16.6%' : binColor?.toLowerCase() === 'green' ? '50%' : '83.3%',
                transform: 'translateX(-50%)',
                animation: 'dropWaste 2.5s infinite ease-in-out',
                zIndex: 10
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--on-surface-variant)' }}>
                  {category === 'plastic' ? 'water_bottle' : category === 'paper' ? 'description' : category === 'organic' ? 'compost' : category === 'metal' ? 'settings' : 'devices'}
                </span>
              </div>

              {/* Colored Bins */}
              {[
                { id: 'blue', color: '#2196F3', label: 'Blue Bin (Dry/Recyclables)' },
                { id: 'green', color: '#4CAF50', label: 'Green Bin (Wet/Organic)' },
                { id: 'red', color: '#F44336', label: 'Red Bin (Reject/Hazardous)' }
              ].map(bin => {
                const targetColor = binColor?.toLowerCase() === 'black' ? 'red' : binColor?.toLowerCase() || 'red'; // map black to red bin visually
                const isTarget = targetColor === bin.id;
                
                return (
                  <div key={bin.id} style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    opacity: isTarget ? 1 : 0.3,
                    transform: isTarget ? 'scale(1.15)' : 'scale(0.9)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <div style={{
                      width: '48px', height: '60px',
                      backgroundColor: bin.color,
                      borderRadius: '4px 4px 12px 12px',
                      position: 'relative',
                      border: '3px solid rgba(0,0,0,0.1)'
                    }}>
                      {/* Bin lid */}
                      <div style={{
                        position: 'absolute', top: '-8px', left: '-6px', right: '-6px', height: '8px',
                        backgroundColor: bin.color,
                        borderRadius: '4px',
                        transformOrigin: 'left bottom',
                        animation: isTarget ? 'openLid 2.5s infinite ease-in-out' : 'none'
                      }} />
                      {/* Bin body lines */}
                      <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '12px', width: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '10px', bottom: '10px', right: '12px', width: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              fontWeight: '600', 
              fontSize: '1.05rem',
              color: binColor?.toLowerCase() === 'blue' ? '#1565C0' : binColor?.toLowerCase() === 'green' ? '#2E7D32' : '#C62828',
              background: binColor?.toLowerCase() === 'blue' ? '#E3F2FD' : binColor?.toLowerCase() === 'green' ? '#E8F5E9' : '#FFEBEE',
              padding: '0.75rem',
              borderRadius: '8px'
            }}>
              {binColor?.toLowerCase() === 'blue' ? t('scan.dropBlue') : binColor?.toLowerCase() === 'green' ? t('scan.dropGreen') : t('scan.dropRed')}
            </div>

          <style>{`
            @keyframes dropWaste {
              0% { top: -20px; opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-20deg); }
              15% { opacity: 1; transform: translateX(-50%) scale(1) rotate(0deg); }
              60% { top: 55px; opacity: 1; transform: translateX(-50%) scale(0.6) rotate(15deg); }
              75%, 100% { top: 75px; opacity: 0; transform: translateX(-50%) scale(0.2); }
            }
            @keyframes openLid {
              0%, 100% { transform: rotate(0deg); }
              15%, 65% { transform: rotate(-55deg); }
            }
          `}</style>
          </section>
        ) : (
          <section style={{ margin: '1rem', padding: '1.5rem', background: '#FFEBEE', borderRadius: '16px', color: '#C62828', textAlign: 'center', border: '1px solid #FFCDD2' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>block</span>
            <h3 style={{ marginBottom: '0.5rem' }}>{t('scan.notWasteTitle')}</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{t('scan.notWasteDesc')}</p>
          </section>
        )}

        {/* ── Disposal Tip (FR-06) ── */}
        <section className="scan-disposal-card">
          <div className="scan-disposal-header">
            <div className="scan-disposal-icon-wrap">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <h3 className="scan-disposal-title">{t('scan.disposalTip')}</h3>
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
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--secondary)' }}>{t('scan.reuseTitle')}</h4>
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

          {/* Eco lesson (AI educator) */}
          {!isInvalid && ecoLesson && (
            <div className="scan-disposal-tip-banner" style={{ marginTop: '1rem' }}>
              <span className="material-symbols-outlined scan-tip-icon" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <p className="scan-disposal-tip-text"><strong>{t('scan.whyItMatters')} </strong>{ecoLesson}</p>
            </div>
          )}
        </section>

        {/* ── Impact Preview ── */}
        {!isInvalid && (
          <section className="scan-impact-grid">
            <div className="scan-impact-card">
              <span className="scan-impact-num primary">{typeof co2 === 'number' ? co2.toFixed(2) : co2}</span>
              <span className="scan-impact-label">{t('scan.co2Saved')}</span>
            </div>
            <div className="scan-impact-card">
              <span className="scan-impact-num secondary">+{points}</span>
              <span className="scan-impact-label">{t('scan.ecoPoints')}</span>
            </div>
          </section>
        )}

      </main>

      {error && (
        <div className="log-error-banner" style={{ margin: '0 1rem 0.5rem' }}>
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      <footer className="scan-result-footer">
        {!isInvalid ? (
          <button className="scan-confirm-btn" onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <><span className="material-symbols-outlined log-spin">progress_activity</span> {t('scan.logging')}</>
            ) : confirmed ? (
              <><span className="material-symbols-outlined">check_circle</span> {t('scan.logged')}</>
            ) : (
              <>{t('scan.confirm')} <span className="material-symbols-outlined">check_circle</span></>
            )}
          </button>
        ) : (
          <button className="scan-confirm-btn" style={{ background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }} onClick={handleEdit}>
            {t('scan.retake')}
          </button>
        )}
        <button className="scan-edit-btn" onClick={handleEdit}>{t('scan.editCategory')}</button>
      </footer>
      
      {/* Success Modal */}
      {showModal && (
        <div className="log-modal-overlay">
          <div className="log-modal-backdrop" onClick={() => navigate('/dashboard')} />
          <div className="log-modal-card">
            <div className="log-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>check_circle</span>
            </div>
            <h2 className="log-modal-title">{t('scan.modalTitle')}</h2>
            <p className="log-modal-sub">{t('scan.modalSub')}</p>
            <div className="log-modal-stats">
              <div className="log-modal-stat">
                <span className="log-modal-stat-val primary">+{points}</span>
                <span className="log-modal-stat-label">{t('scan.points')}</span>
              </div>
              <div className="log-modal-stat">
                <span className="log-modal-stat-val tertiary">{typeof co2 === 'number' ? co2.toFixed(2) : co2} kg</span>
                <span className="log-modal-stat-label">{t('scan.co2Saved')}</span>
              </div>
            </div>
            <button className="log-modal-close-btn" onClick={() => navigate('/dashboard')}>{t('scan.backToDashboard')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
