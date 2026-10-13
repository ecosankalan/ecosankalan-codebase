import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import LeaderboardPanel from '../components/challenge/LeaderboardPanel';
import {
  getChallengeById,
  joinChallenge,
  submitChallengeTask,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/challenge-detail.css';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23e8e3dc"/><path d="M10 50l14-14 10 10 8-8 12 12v4H10z" fill="%23bdb6a8"/><circle cx="22" cy="22" r="6" fill="%23bdb6a8</svg>';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  const [showSubmit, setShowSubmit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const fileInputRef = useRef(null);

  const fmtTimeLeft = (ms) => {
    if (ms <= 0) return t('challenges.windowClosed');
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return t('challenges.timeLeftHM', { h, m });
    if (m > 0) return t('challenges.timeLeftMS', { m, s });
    return t('challenges.timeLeftS', { s });
  };

  const fmtStartsIn = (ms) => {
    if (ms <= 0) return t('challenges.unlocked');
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h >= 24) {
      const d = Math.floor(h / 24);
      return t('challenges.unlocksInDH', { d, h: h % 24 });
    }
    if (h > 0) return t('challenges.unlocksInHM', { h, m });
    return t('challenges.unlocksInM', { m });
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const loadChallenge = useCallback(async () => {
    try {
      const { data: payload } = await getChallengeById(id);
      setData(payload);
    } catch (err) {
      setError(err.message || t('challenges.detailLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    setLoading(true);
    loadChallenge();
  }, [loadChallenge]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setSubmitError(t('challenges.errImgType'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setSubmitError(t('challenges.errImgSize'));
      return;
    }
    setSubmitError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!data) return;
    const today = data.dailySlots?.[data.dayIndexToday];
    if (!today) {
      setSubmitError(t('challenges.errNoTask'));
      return;
    }
    if (data.taskTemplate?.imageRequired !== false && !imageFile) {
      setSubmitError(t('challenges.errAttach'));
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('dayIndex', String(data.dayIndexToday));
      if (remarks.trim()) fd.append('remarks', remarks.trim());
      if (imageFile) fd.append('image', imageFile);
      const { data: payload } = await submitChallengeTask(id, fd);
      setSubmitSuccess(t('challenges.pointsAwarded', { count: payload.progress.pointsAwarded }));
      setShowSubmit(false);
      setImageFile(null);
      setImagePreview('');
      setRemarks('');
      await loadChallenge();
      setTimeout(() => setSubmitSuccess(''), 4000);
    } catch (err) {
      setSubmitError(err.message || t('challenges.errSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    try {
      await joinChallenge(id);
      await loadChallenge();
    } catch (err) {
      setError(err.message || t('challenges.errJoin'));
    }
  };

  if (loading) {
    return (
      <div className="cd-root">
        <Navbar />
        <main className="cd-main">
          <div className="cd-state">
            <span className="material-symbols-outlined cd-spin">progress_activity</span>
            {t('challenges.detailLoading')}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="cd-root">
        <Navbar />
        <main className="cd-main">
          <button className="cd-back" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
            {t('challenges.back')}
          </button>
          <div className="cd-state error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!data) return null;

  const {
    title,
    description,
    taskTemplate,
    durationDays,
    dayIndexToday,
    dailySlots = [],
    totalPoints = 0,
    allCompleted = false,
  } = data;

  const todaySlot = dayIndexToday != null ? dailySlots[dayIndexToday] : null;
  const todayStatus = todaySlot?.status;
  const submittedDays = dailySlots.filter((s) => s.submission).length;
  const progressPct = durationDays > 0 ? Math.round((submittedDays / durationDays) * 100) : 0;
  const submittedToday = !!todaySlot?.submission;

  return (
    <div className="cd-root">
      <Navbar />

      <main className="cd-main">
        <button className="cd-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          {t('challenges.back')}
        </button>

        {submitSuccess && (
          <div className="cd-toast success">
            <span className="material-symbols-outlined">check_circle</span>
            {submitSuccess}
          </div>
        )}

        <section className="cd-hero">
          <div className="cd-hero-bg" />
          <span className="cd-eyebrow">{t('challenges.detailEyebrow')}</span>
          <h1 className="cd-title">{title}</h1>
          <p className="cd-desc">{description}</p>

          <div className="cd-meta">
            <div className="cd-meta-pill">
              <span className="material-symbols-outlined">calendar_today</span>
              {t('challenges.days', { count: durationDays })}
            </div>
            <div className="cd-meta-pill">
              <span className="material-symbols-outlined">flag</span>
              {t('challenges.endsOn', { date: fmtDate(data.expiryDate) })}
            </div>
            <div className="cd-meta-pill primary">
              <span className="material-symbols-outlined">bolt</span>
              {t('challenges.dayOf', { day: submittedDays + 1 > durationDays ? durationDays : submittedDays + 1, total: durationDays })}
            </div>
          </div>

          <div className="cd-progress">
            <div className="cd-progress-bar">
              <div className="cd-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="cd-progress-meta">
              <span><strong>{totalPoints}</strong> {t('challenges.ptsEarned')}</span>
              {allCompleted && (
                <span className="cd-complete-tag">
                  <span className="material-symbols-outlined">verified</span>
                  {t('challenges.completed')}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="cd-today">
          <h2 className="cd-section-title">
            <span className="material-symbols-outlined">today</span>
            {dayIndexToday != null ? t('challenges.dayTask', { day: dayIndexToday + 1 }) : t('challenges.noActiveDay')}
          </h2>

          {!data.joined && (
            <div className="cd-join-prompt">
              <p>{t('challenges.joinPrompt')}</p>
              <button className="cd-btn primary" onClick={handleJoin}>
                {t('challenges.joinChallenge')}
              </button>
            </div>
          )}

          {data.joined && todaySlot && (
            <div className={`cd-today-card status-${todayStatus}`}>
              <p className="cd-task-desc">{taskTemplate?.description}</p>

              {todayStatus === 'unlocked' && !submittedToday && (
                <>
                  <div className="cd-timer">
                    <span className="material-symbols-outlined">timer</span>
                    {fmtTimeLeft(new Date(todaySlot.expiresAt).getTime() - now)}
                  </div>
                  <button className="cd-btn primary big" onClick={() => setShowSubmit(true)}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    {t('challenges.submitProof')}
                  </button>
                  <p className="cd-hint">
                    {t('challenges.earlyHint', { max: taskTemplate?.pointsConfig?.maxPoints ?? 100 })}
                  </p>
                </>
              )}

              {todayStatus === 'unlocked' && submittedToday && (
                <div className="cd-submitted-today">
                  <span className="material-symbols-outlined">check_circle</span>
                  <div>
                    <strong>{t('challenges.submittedToday')}</strong>
                    <p>
                      +{todaySlot.submission.pointsAwarded} {t('challenges.ptsShort')} •{' '}
                      {new Date(todaySlot.submission.submittedAt).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {todayStatus === 'locked' && (
                <div className="cd-locked">
                  <span className="material-symbols-outlined">lock</span>
                  <span>{fmtStartsIn(new Date(todaySlot.unlockAt).getTime() - now)}</span>
                </div>
              )}

              {todayStatus === 'expired' && (
                <div className="cd-expired">
                  <span className="material-symbols-outlined">event_busy</span>
                  <span>{t('challenges.windowClosedDay')}</span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="cd-history">
          <h2 className="cd-section-title">
            <span className="material-symbols-outlined">history</span>
            {t('challenges.allDays')}
          </h2>

          <div className="cd-day-grid">
            {dailySlots.map((slot) => {
              const sub = slot.submission;
              const isToday = dayIndexToday === slot.dayIndex;
              return (
                <div
                  key={slot.dayIndex}
                  className={`cd-day-tile ${slot.status}${sub ? ' submitted' : ''}${isToday ? ' today' : ''}`}
                >
                  <div className="cd-day-num">{t('challenges.dayNum', { day: slot.dayIndex + 1 })}</div>
                  <div className="cd-day-status-icon">
                    {sub ? (
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : slot.status === 'expired' ? (
                      <span className="material-symbols-outlined">cancel</span>
                    ) : slot.status === 'locked' ? (
                      <span className="material-symbols-outlined">lock</span>
                    ) : (
                      <span className="material-symbols-outlined">radio_button_unchecked</span>
                    )}
                  </div>
                  {sub && (
                    <div className="cd-day-meta">
                      <span>+{sub.pointsAwarded} {t('challenges.ptsShort')}</span>
                      {sub.imageUrl && (
                        <img
                          src={sub.imageUrl}
                          alt={t('challenges.proofAlt', { day: slot.dayIndex + 1 })}
                          className="cd-day-thumb"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="cd-leaderboard-cta">
          <button className="cd-btn ghost big" onClick={() => setShowLeaderboard(true)}>
            <span className="material-symbols-outlined">leaderboard</span>
            {t('challenges.viewLeaderboard')}
          </button>
        </section>
      </main>

      {showSubmit && todaySlot && (
        <div className="cd-modal-overlay" onClick={() => !submitting && setShowSubmit(false)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <h3>{t('challenges.modalTitle')}</h3>
              <button
                className="cd-close"
                onClick={() => setShowSubmit(false)}
                disabled={submitting}
                aria-label={t('challenges.close')}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="cd-modal-task">{taskTemplate?.description}</p>

            <div
              className={`cd-dropzone${imagePreview ? ' has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt={t('challenges.previewAlt')} className="cd-dropzone-preview" />
              ) : (
                <>
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <p>{t('challenges.dropHint')}</p>
                  <small>{t('challenges.dropTypes')}</small>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            <label className="cd-remarks-label">
              {t('challenges.remarksLabel')}
              <textarea
                className="cd-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t('challenges.remarksPh')}
                maxLength={500}
                rows={3}
              />
            </label>

            {submitError && (
              <div className="cd-error">
                <span className="material-symbols-outlined">error</span>
                {submitError}
              </div>
            )}

            <div className="cd-modal-actions">
              <button
                className="cd-btn ghost"
                onClick={() => setShowSubmit(false)}
                disabled={submitting}
              >
                {t('challenges.cancel')}
              </button>
              <button
                className="cd-btn primary"
                onClick={handleSubmit}
                disabled={submitting || (taskTemplate?.imageRequired !== false && !imageFile)}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined cd-spin">progress_activity</span>
                    {t('challenges.submitting')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    {t('challenges.submit')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <LeaderboardPanel
          challengeId={id}
          currentUserId={user?._id || user?.userId}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
