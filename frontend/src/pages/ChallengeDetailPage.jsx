import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const fmtTimeLeft = (ms) => {
  if (ms <= 0) return 'Window closed';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
};

const fmtStartsIn = (ms) => {
  if (ms <= 0) return 'Unlocked';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `Unlocks in ${d}d ${h % 24}h`;
  }
  if (h > 0) return `Unlocks in ${h}h ${m}m`;
  return `Unlocks in ${m}m`;
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const loadChallenge = useCallback(async () => {
    try {
      const { data: payload } = await getChallengeById(id);
      setData(payload);
    } catch (err) {
      setError(err.message || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      setSubmitError('Only JPG, PNG, and WEBP are allowed');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setSubmitError('Image exceeds the 5MB limit');
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
      setSubmitError('No active task right now');
      return;
    }
    if (data.taskTemplate?.imageRequired !== false && !imageFile) {
      setSubmitError('Please attach an image as proof');
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
      setSubmitSuccess(`+${payload.progress.pointsAwarded} points awarded!`);
      setShowSubmit(false);
      setImageFile(null);
      setImagePreview('');
      setRemarks('');
      await loadChallenge();
      setTimeout(() => setSubmitSuccess(''), 4000);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    try {
      await joinChallenge(id);
      await loadChallenge();
    } catch (err) {
      setError(err.message || 'Failed to join');
    }
  };

  if (loading) {
    return (
      <div className="cd-root">
        <Navbar />
        <main className="cd-main">
          <div className="cd-state">
            <span className="material-symbols-outlined cd-spin">progress_activity</span>
            Loading challenge…
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
            Back
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
          Back
       </button>

        {submitSuccess && (
          <div className="cd-toast success">
            <span className="material-symbols-outlined">check_circle</span>
            {submitSuccess}
         </div>
        )}

        <section className="cd-hero">
          <div className="cd-hero-bg" />
          <span className="cd-eyebrow">Eco Challenge</span>
          <h1 className="cd-title">{title}</h1>
          <p className="cd-desc">{description}</p>

          <div className="cd-meta">
            <div className="cd-meta-pill">
              <span className="material-symbols-outlined">calendar_today</span>
              {durationDays} day{durationDays === 1 ? '' : 's'}
           </div>
            <div className="cd-meta-pill">
              <span className="material-symbols-outlined">flag</span>
              Ends {fmtDate(data.expiryDate)}
           </div>
            <div className="cd-meta-pill primary">
              <span className="material-symbols-outlined">bolt</span>
              Day {submittedDays + 1 > durationDays ? durationDays : submittedDays + 1} / {durationDays}
           </div>
         </div>

          <div className="cd-progress">
            <div className="cd-progress-bar">
              <div className="cd-progress-fill" style={{ width: `${progressPct}%` }} />
           </div>
            <div className="cd-progress-meta">
              <span><strong>{totalPoints}</strong> pts earned</span>
              {allCompleted && (
                <span className="cd-complete-tag">
                  <span className="material-symbols-outlined">verified</span>
                  Completed
               </span>
              )}
           </div>
         </div>
       </section>

        <section className="cd-today">
          <h2 className="cd-section-title">
            <span className="material-symbols-outlined">today</span>
            {dayIndexToday != null ? `Day ${dayIndexToday + 1} task` : 'No active day'}
         </h2>

          {!data.joined && (
            <div className="cd-join-prompt">
              <p>Join this challenge to start submitting today's proof</p>
              <button className="cd-btn primary" onClick={handleJoin}>
                Join challenge
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
                    Submit proof
                 </button>
                  <p className="cd-hint">
                    Earlier submissions earn more points. Max {taskTemplate?.pointsConfig?.maxPoints ?? 100} pts.
                 </p>
                </>
              )}

              {todayStatus === 'unlocked' && submittedToday && (
                <div className="cd-submitted-today">
                  <span className="material-symbols-outlined">check_circle</span>
                  <div>
                    <strong>Submitted for today</strong>
                    <p>
                      +{todaySlot.submission.pointsAwarded} pts •{' '}
                      {new Date(todaySlot.submission.submittedAt).toLocaleTimeString([], {
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
                  <span>The submission window has closed for this day</span>
               </div>
              )}
           </div>
          )}
       </section>

        <section className="cd-history">
          <h2 className="cd-section-title">
            <span className="material-symbols-outlined">history</span>
            All days
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
                  <div className="cd-day-num">Day {slot.dayIndex + 1}</div>
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
                      <span>+{sub.pointsAwarded} pts</span>
                      {sub.imageUrl && (
                        <img
                          src={sub.imageUrl}
                          alt={`Day ${slot.dayIndex + 1} proof`}
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
            View leaderboard
         </button>
       </section>
     </main>

      {showSubmit && todaySlot && (
        <div className="cd-modal-overlay" onClick={() => !submitting && setShowSubmit(false)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <h3>Submit proof</h3>
              <button
                className="cd-close"
                onClick={() => setShowSubmit(false)}
                disabled={submitting}
                aria-label="Close"
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
                <img src={imagePreview} alt="Preview" className="cd-dropzone-preview" />
              ) : (
                <>
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <p>Tap to upload or drag & drop</p>
                  <small>JPG, PNG, WEBP up to 5 MB</small>
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
              Remarks (optional)
              <textarea
                className="cd-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add a short note (max 500 chars)"
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
                Cancel
             </button>
              <button
                className="cd-btn primary"
                onClick={handleSubmit}
                disabled={submitting || (taskTemplate?.imageRequired !== false && !imageFile)}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined cd-spin">progress_activity</span>
                    Submitting…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit
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
