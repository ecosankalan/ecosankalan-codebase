import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/common/BottomNav';
import Navbar from '../components/common/Navbar';
import { logWaste, scanWasteImage } from '../services/api';
import '../styles/waste.css';

import { useStats } from '../context/StatsContext';

const CATEGORIES = [
  { id: 'plastic',  label: 'Plastic',  icon: 'inventory_2',            bg: 'bg-secondary-container', iconColor: 'text-on-secondary-container' },
  { id: 'organic',  label: 'Organic',  icon: 'compost',                bg: 'bg-primary-container',   iconColor: 'text-on-primary-container',  fill: true },
  { id: 'e-waste',  label: 'E-waste',  icon: 'devices_other',          bg: 'bg-tertiary-fixed',      iconColor: 'text-on-tertiary-fixed-variant' },
  { id: 'metal',    label: 'Metal',    icon: 'precision_manufacturing', bg: 'bg-surface-container-highest', iconColor: 'text-on-surface-variant' },
  { id: 'paper',    label: 'Paper',    icon: 'description',            bg: 'bg-secondary-fixed',     iconColor: 'text-on-secondary-fixed-variant' },
  { id: 'other',    label: 'Other',    icon: 'pending',                bg: 'bg-surface-dim',         iconColor: 'text-on-surface' },
];

// Hazardous waste types (backend enum)
const HAZARDS = [
  { id: 'sanitary',       label: 'Sanitary waste' },
  { id: 'biomedical',     label: 'Biomedical / masks' },
  { id: 'e-waste-unsafe', label: 'Unsafe e-waste (batteries, CFL)' },
  { id: 'chemical',       label: 'Chemical / paint' },
  { id: 'sharp',          label: 'Sharps (glass, blades)' },
  { id: 'other-hazard',   label: 'Other hazard' },
];

// Points per kg for preview (matches backend)
const PTS_MAP = { plastic: 5, organic: 3, 'e-waste': 10, metal: 6, paper: 4, other: 2 };

const CAT_KEY_MAP = { plastic: 'catPlastic', organic: 'catOrganic', 'e-waste': 'catEwaste', metal: 'catMetal', paper: 'catPaper' };
const HAZARD_KEY_MAP = { sanitary: 'hazardSanitary', biomedical: 'hazardBiomedical', 'e-waste-unsafe': 'hazardEwasteUnsafe', chemical: 'hazardChemical', sharp: 'hazardSharp', 'other-hazard': 'hazardOther' };

export default function WasteLogPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { refreshAllStats } = useStats();

  const [selected,   setSelected]   = useState('organic');
  const [qty,        setQty]        = useState(2.5);
  const [notes,      setNotes]      = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning,   setScanning]   = useState(null);
  const [error,      setError]      = useState('');
  const [logResult,  setLogResult]  = useState(null); // holds { pointsEarned }
  const [isHazardous, setIsHazardous] = useState(false);
  const [hazardType,  setHazardType]  = useState('');
  const [safetyAck,   setSafetyAck]   = useState(false);

  // Clean up any active scan on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Escape closes the success modal (a11y)
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const pts = Math.round((PTS_MAP[selected] || 2) * qty);

  const catLabel = (id) => t(`waste.${CAT_KEY_MAP[id] || 'catOther'}`);
  const hazardLabel = (id) => t(`waste.${HAZARD_KEY_MAP[id] || 'hazardOther'}`);

  // ── Manual Log Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    if (isHazardous && !hazardType) {
      setError(t('waste.errHazardType'));
      return;
    }
    if (isHazardous && !safetyAck) {
      setError(t('waste.errSafetyAck'));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await logWaste({
        category: selected,
        quantity: qty,
        unit: 'kg',
        description: notes,
        logMethod: 'manual',
        ...(isHazardous ? { isHazardous: true, hazardType, safetyAck: true } : {}),
      });
      setLogResult({ pointsEarned: data.pointsEarned, autoTracked: data.autoTracked || [] });
      await refreshAllStats(); // Refresh global stats immediately after logging
      setShowModal(true);
    } catch (err) {
      setError(err.message || t('waste.errFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setLogResult(null);
    setNotes('');
    setIsHazardous(false);
    setHazardType('');
    setSafetyAck(false);
  };

  // ── AI Scan ──────────────────────────────────────────────────────────────
  const handleAIScan = () => {
    fileInputRef.current?.click();
  };

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setScanning(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleFileSelect = async (e, source) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setScanning(source);
    setError('');
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    try {
      const { data } = await scanWasteImage(formData, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const parsed = data.parsed || {};
      const report = parsed.reports?.[0] || {};
      
      // Calculate preview points using 0.5kg as a default AI weight
      const textToSearch = ((report.wasteCategory || '') + ' ' + (report.identifiedObject || '') + ' ' + (report.material || '')).toLowerCase();
      let catKey = 'other';
      if (textToSearch.includes('plastic') || textToSearch.includes('pet') || textToSearch.includes('polyester')) catKey = 'plastic';
      else if (textToSearch.includes('paper') || textToSearch.includes('cardboard') || textToSearch.includes('carton') || textToSearch.includes('newspaper')) catKey = 'paper';
      else if (textToSearch.includes('metal') || textToSearch.includes('can') || textToSearch.includes('aluminum') || textToSearch.includes('steel') || textToSearch.includes('iron') || textToSearch.includes('tin')) catKey = 'metal';
      else if (textToSearch.includes('organic') || textToSearch.includes('food') || textToSearch.includes('compost') || textToSearch.includes('fruit') || textToSearch.includes('veg') || textToSearch.includes('leaf') || textToSearch.includes('wood') || textToSearch.includes('peel')) catKey = 'organic';
      else if (textToSearch.includes('e-waste') || textToSearch.includes('electronic') || textToSearch.includes('battery') || textToSearch.includes('cable') || textToSearch.includes('phone') || textToSearch.includes('computer') || textToSearch.includes('wire')) catKey = 'e-waste';
      
      const previewQty = 0.5;
      const previewPts = Math.round((PTS_MAP[catKey] || 2) * previewQty);

      // Navigate to scan result page with actual AI result
      navigate('/scan-result', {
        state: {
          result: {
            label:      report.identifiedObject || t('waste.unknownItem'),
            category:   report.wasteCategory    || 'other',
            material:   report.material         || t('waste.unknownMaterial'),
            binColor:   report.binColor         || 'None',
            confidence: typeof report.confidence === 'number' ? (report.confidence <= 1 ? Math.round(report.confidence * 100) : Math.round(report.confidence)) : 0,
            points:     previewPts,
            steps:      report.beforeThrowing   || [],
            reuseIdeas: report.reuseIdeas       || [],
            ecoLesson:  report.ecoLesson        || '',
            imageUrl:   URL.createObjectURL(files[0]),
          },
        },
      });
    } catch (err) {
      if (axios.isCancel?.(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        return; // Silently exit on user cancellation
      }
      setError(err.message || t('waste.errScanFailed'));
    } finally {
      if (abortControllerRef.current === controller && !controller.signal.aborted) {
        setScanning(null);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="log-root">

      <Navbar />

      <main className="log-main">

        <section className="log-hero">
          <h1 className="log-hero-title">{t('waste.heroTitle')}</h1>
          <p className="log-hero-sub">{t('waste.heroSub')}</p>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="log-error-banner">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* AI Scan Card */}
        <section className="log-ai-card">
          <div className="log-ai-bg-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '6rem' }}>photo_camera</span>
          </div>
          <div className="log-ai-content">
            <div className="log-ai-badge">{t('waste.aiBadge')}</div>
            <h2 className="log-ai-title">{t('waste.aiTitle')}</h2>
            <p className="log-ai-desc">{t('waste.aiDesc')}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', width: '100%' }}>
              <button
                className="log-ai-btn"
                style={{ flex: 1, padding: '0.75rem 0.5rem', fontSize: '0.9rem', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={!!scanning}
              >
                {scanning === 'upload' ? (
                  <span className="material-symbols-outlined log-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">upload_file</span>
                )}
                {t('waste.upload')}
              </button>
              <button
                className="log-ai-btn"
                style={{ flex: 1, padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}
                onClick={() => cameraInputRef.current?.click()}
                disabled={!!scanning}
              >
                {scanning === 'camera' ? (
                  <span className="material-symbols-outlined log-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">photo_camera</span>
                )}
                {t('waste.camera')}
              </button>
            </div>

            {scanning && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.95)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginTop: '1rem', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined log-spin" style={{ fontSize: '1.2rem' }}>progress_activity</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('waste.analyzing')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelScan}
                  style={{ background: 'var(--surface-container-high)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}
                  aria-label={t('waste.cancelScan')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                </button>
              </div>
            )}

            {/* Hidden file input for gallery upload (no capture attribute) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFileSelect(e, 'upload')}
            />
            {/* Hidden file input for live camera (forces camera on mobile) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => handleFileSelect(e, 'camera')}
            />
          </div>
        </section>

        {/* Category Grid */}
        <section className="log-section">
          <div className="log-section-header">
            <h3 className="log-section-title">{t('waste.selectCategory')}</h3>
            <span className="log-section-tag">{t('waste.manualEntry')}</span>
          </div>
          <div className="log-category-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`log-cat-btn${selected === cat.id ? ' selected' : ''}`} onClick={() => setSelected(cat.id)} aria-pressed={selected === cat.id} aria-label={t('waste.catAria', { label: catLabel(cat.id) })}>
                <div className={`log-cat-icon ${cat.bg}${selected === cat.id ? ' scaled' : ''}`}>
                  <span className={`material-symbols-outlined ${cat.iconColor}`} style={cat.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{cat.icon}</span>
                </div>
                <span className={`log-cat-label${selected === cat.id ? ' active' : ''}`}>{catLabel(cat.id)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Quantity Slider */}
        <section className="log-qty-card">
          <div className="log-qty-header">
            <div>
              <h3 className="log-qty-title">{t('waste.qtyTitle')}</h3>
              <p className="log-qty-sub">{t('waste.qtySub')}</p>
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
            aria-label={t('waste.qtyAria')}
            aria-valuetext={t('waste.qtyValue', { qty: qty.toFixed(1) })}
            onChange={e => setQty(parseFloat(e.target.value))}
          />
          <div className="log-slider-labels">
            <span>0.1 kg</span><span>5.0 kg</span><span>10.0 kg</span>
          </div>
        </section>

        {/* Live points preview */}
        <div className="log-preview">
          <div className="log-preview-item">
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>eco</span>
            <div>
              <span className="log-preview-val">+{pts} {t('waste.pts')}</span>
              <span className="log-preview-label">{t('waste.ecoPoints')}</span>
            </div>
          </div>
          <div className="log-preview-hint">
            {t('waste.previewHint', { cat: catLabel(selected), ptsPerKg: PTS_MAP[selected] })}
          </div>
        </div>

        {/* Notes */}
        <section className="log-notes-section">
          <label className="log-notes-label">{t('waste.notes')}</label>
          <textarea
            className="log-notes-textarea"
            placeholder={t('waste.notesPlaceholder')}
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </section>

        {/* Hazardous waste flag (health & safety) */}
        <section className="log-notes-section">
          <label className="log-notes-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isHazardous}
              onChange={e => { setIsHazardous(e.target.checked); setSafetyAck(false); }}
              aria-label={t('waste.hazardAria')}
            />
            {t('waste.hazardLabel')}
          </label>
          {isHazardous && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select
                className="log-notes-textarea"
                value={hazardType}
                onChange={e => setHazardType(e.target.value)}
                aria-label={t('waste.hazardSelect')}
                style={{ padding: '0.75rem' }}
              >
                <option value="">{t('waste.hazardSelectPlaceholder')}</option>
                {HAZARDS.map(h => (
                  <option key={h.id} value={h.id}>{hazardLabel(h.id)}</option>
                ))}
              </select>
              <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '0.75rem', fontSize: '0.85rem', color: '#5d4037' }}>
                {t('waste.hazardWarning')}
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={safetyAck}
                  onChange={e => setSafetyAck(e.target.checked)}
                  aria-label={t('waste.safetyAck')}
                  style={{ marginTop: '0.2rem' }}
                />
                {t('waste.safetyAck')}
              </label>
            </div>
          )}
        </section>

        <div className="log-submit-wrap">
          <button className="log-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="material-symbols-outlined log-spin">progress_activity</span>
                {t('waste.logging')}
              </>
            ) : (
              <>
                {t('waste.logSubmit')}
                <span className="material-symbols-outlined">auto_awesome</span>
              </>
            )}
          </button>
        </div>

      </main>

      <BottomNav />

      {/* Success Modal */}
      {showModal && (
        <div className="log-modal-overlay" role="dialog" aria-modal="true" aria-label={t('waste.modalAria')}>
          <div className="log-modal-backdrop" onClick={handleClose} />
          <div className="log-modal-card">
            <div className="log-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>check_circle</span>
            </div>
            <h2 className="log-modal-title">{t('waste.modalTitle')}</h2>
            <p className="log-modal-sub">{t('waste.modalSub')}</p>
            <div className="log-modal-stats">
              <div className="log-modal-stat">
                <span className="log-modal-stat-val primary">+{logResult?.pointsEarned ?? pts}</span>
                <span className="log-modal-stat-label">{t('waste.points')}</span>
              </div>
            </div>
            {(logResult?.autoTracked?.length ?? 0) > 0 && (
              <div style={{ margin: '0.6rem 0 0', textAlign: 'center' }}>
                {logResult.autoTracked.map((c) => (
                  <p key={c.challengeId} style={{ fontSize: '0.8rem', color: 'var(--primary)', margin: '0.2rem 0', fontWeight: 600 }}>
                    {t('waste.autoTrackedDay', { title: c.title, day: c.dayIndex + 1 })}
                  </p>
                ))}
              </div>
            )}
            <button className="log-modal-close-btn" onClick={handleClose}>{t('waste.modalClose')}</button>
          </div>
        </div>
      )}

    </div>
  );
}
