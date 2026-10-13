import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { getActiveChallenges, joinChallenge } from '../services/api';
import '../styles/weekly-challenges.css';

const FILTER_TAB_KEYS = ['All', 'In Progress', 'Not Started', 'Completed'];

// Status badge mapping per taskTemplate characteristics
const ICON_MAP = {
  bottle: { icon: 'water_drop', bg: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
  bag:    { icon: 'shopping_bag', bg: 'var(--tertiary-fixed)',     color: 'var(--on-tertiary-fixed-variant)' },
  energy: { icon: 'bolt',         bg: 'var(--primary-container)',  color: 'var(--on-primary-container)' },
  food:   { icon: 'restaurant',   bg: 'var(--tertiary-fixed)',     color: 'var(--on-tertiary-fixed-variant)' },
  default:{ icon: 'emoji_events', bg: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' },
};

const pickIcon = (ch) => {
  const haystack = `${ch?.taskTemplate?.action || ''} ${ch?.taskTemplate?.category || ''} ${ch?.title || ''}`.toLowerCase();
  if (haystack.includes('bottle') || haystack.includes('water')) return ICON_MAP.bottle;
  if (haystack.includes('bag'))    return ICON_MAP.bag;
  if (haystack.includes('energy') || haystack.includes('electric')) return ICON_MAP.energy;
  if (haystack.includes('food')    || haystack.includes('compost')) return ICON_MAP.food;
  return ICON_MAP.default;
};

const deriveStatus = (challenge) => {
  if (challenge.userProgress?.allCompleted) return 'Completed';
  if (!challenge.joined) return 'Not Started';
  const submitted = (challenge.userProgress?.submittedDays || []).length;
  return submitted > 0 ? 'In Progress' : 'Not Started';
};

const buildDayDots = (challenge) => {
  const total = challenge.durationDays || 1;
  const submitted = new Set(challenge.userProgress?.submittedDays || []);
  return Array.from({ length: total }).map((_, i) => ({
    dayIndex: i,
    submitted: submitted.has(i),
  }));
};

const timeLeft = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  return `${h}h`;
};

const TAB_LABEL_KEY = {
  'All': 'challenges.tabAll',
  'In Progress': 'challenges.tabInProgress',
  'Not Started': 'challenges.tabNotStarted',
  'Completed': 'challenges.tabCompleted',
};

const STATUS_LABEL_KEY = {
  'In Progress': 'challenges.tabInProgress',
  'Not Started': 'challenges.tabNotStarted',
  'Completed': 'challenges.tabCompleted',
};

export default function WeeklyChallengesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [tab, setTab] = useState('All');
  const [actionError, setActionError] = useState('');

  const { data: challenges = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['challenges', 'active'],
    queryFn: async () => {
      const res = await getActiveChallenges();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const error = actionError || (queryError ? (queryError.message || t('challenges.loadFailed')) : '');

  const handleJoin = async (challengeId) => {
    try {
      setActionError('');
      await joinChallenge(challengeId);
      queryClient.invalidateQueries({ queryKey: ['challenges', 'active'] });
    } catch (err) {
      setActionError(err.message || t('challenges.joinFailed'));
    }
  };

  const enriched = challenges.map((ch) => ({
    ...ch,
    _status: deriveStatus(ch),
    _icon: pickIcon(ch),
    _timeLeft: timeLeft(ch.expiryDate),
    _dayDots: buildDayDots(ch),
  }));

  const visible = tab === 'All'
    ? enriched
    : enriched.filter((c) => c._status === tab);

  return (
    <div className="wc-root">
      <Navbar />

      <main className="wc-main">
        <div className="wc-header">
          <button className="wc-back-btn" onClick={() => navigate('/dashboard')} aria-label={t('challenges.back')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <span className="wc-eyebrow">{t('challenges.eyebrow')}</span>
            <h1 className="wc-title">{t('challenges.title')}</h1>
            <p className="wc-subtitle">{t('challenges.subtitle')}</p>
          </div>
        </div>

        <div className="wc-tabs">
          {FILTER_TAB_KEYS.map((tk) => (
            <button
              key={tk}
              className={`wc-tab${tab === tk ? ' active' : ''}`}
              onClick={() => setTab(tk)}
            >
              {t(TAB_LABEL_KEY[tk])}
            </button>
          ))}
        </div>

        {loading && <Loader text={t('challenges.loading')} />}

        {error && (
          <div className="wc-empty">
            <span className="material-symbols-outlined wc-empty-icon" style={{ color: 'var(--error)' }}>error</span>
            <p>{error}</p>
          </div>
        )}

        <div className="wc-grid">
          {!loading && visible.length === 0 && (
            <div className="wc-empty">
              <span className="material-symbols-outlined wc-empty-icon">inbox</span>
              <p>{t('challenges.emptyCategory')}</p>
            </div>
          )}

          {visible.map((ch) => {
            const iconMeta = ch._icon;
            const isCompleted = ch._status === 'Completed';
            const submittedCount = ch._dayDots.filter((d) => d.submitted).length;
            const totalDays = ch.durationDays || 1;
            return (
              <article
                key={ch._id}
                className={`wc-card${isCompleted ? ' completed' : ''}`}
              >
                {isCompleted && <div className="wc-card-completed-bg" />}

                <div className="wc-card-top-row">
                  <div className="wc-card-icon-wrap" style={{ background: iconMeta.bg, color: iconMeta.color }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{iconMeta.icon}</span>
                  </div>

                  <div className="wc-card-meta">
                    {ch._timeLeft && (
                      <div className="wc-badge timer">
                        <span className="material-symbols-outlined wc-badge-icon" style={{ color: 'var(--tertiary)' }}>timer</span>
                        <span>{t('challenges.endsIn', { time: ch._timeLeft })}</span>
                      </div>
                    )}
                    <div className="wc-badge neutral">
                      <span className="material-symbols-outlined wc-badge-icon">calendar_today</span>
                      <span>{t('challenges.days', { count: totalDays })}</span>
                    </div>
                  </div>
                </div>

                <h3 className="wc-card-title">{ch.title}</h3>
                <p className="wc-card-desc">
                  {ch.taskTemplate?.description || ch.description || t('challenges.fallbackDesc', { count: totalDays })}
                </p>

                {/* Day dots strip */}
                {ch.joined && (
                  <div className="wc-dots" aria-label={t('challenges.daysCompletedAria', { submitted: submittedCount, total: totalDays })}>
                    {ch._dayDots.map((d) => (
                      <span
                        key={d.dayIndex}
                        className={`wc-dot${d.submitted ? ' done' : ''}${ch.dayIndexToday === d.dayIndex ? ' today' : ''}`}
                      />
                    ))}
                  </div>
                )}

                {/* Footer: status + CTA */}
                <div className="wc-card-footer">
                  <div className="wc-card-status">
                    {ch.joined ? (
                      <span className={`wc-status-pill ${isCompleted ? 'complete' : ch._status === 'In Progress' ? 'inprogress' : 'nostart'}`}>
                        {isCompleted && <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>check_circle</span>}
                        {t(STATUS_LABEL_KEY[ch._status])}
                        {ch.userProgress?.totalPoints > 0 && <span> · {t('challenges.pts', { count: ch.userProgress.totalPoints })}</span>}
                      </span>
                    ) : (
                      <span className="wc-status-pill nostart">{t('challenges.notJoined')}</span>
                    )}
                  </div>

                  {isCompleted ? (
                    <div className="wc-completed-label">
                      <span className="material-symbols-outlined">check_circle</span>
                      {t('challenges.completed')}
                    </div>
                  ) : !ch.joined ? (
                    <button
                      className="wc-btn start"
                      onClick={() => handleJoin(ch._id)}
                      style={{ background: 'var(--tertiary)', color: 'var(--on-tertiary)' }}
                    >
                      {t('challenges.join')}
                    </button>
                  ) : (
                    <button
                      className="wc-btn continue"
                      onClick={() => navigate(`/challenge/${ch._id}`)}
                    >
                      {submittedCount > 0 ? t('challenges.continue') : t('challenges.start')}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
