import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import TutorialOverlay from '../components/common/TutorialOverlay';
import { getWasteStats, getActiveChallenges, getUpcomingEvents, getProfile, getWasteHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../context/StatsContext';
import useFCM from '../hooks/useFCM';
import '../styles/dashboard.css';

const WASTE_FACT_KEYS = ['fact1', 'fact2', 'fact3', 'fact4', 'fact5'];

// Eco Score from stats (simple formula for now)
const computeEcoScore = (stats) => {
  if (!stats) return 0;
  const score = Math.min(100, Math.round(
    (stats.totalKg || 0) * 2 +
    (stats.totalCo2Saved || 0) * 1.5 +
    (stats.totalPointsEarned || 0) * 0.1
  ));
  return Math.max(10, score);
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
  const { user, updateUser } = useAuth();
  useFCM(user); // Initialize FCM when the user is available

  const [factIndex,   setFactIndex]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  // Real data state
  const { statsData, loading: statsLoading } = useStats();
  // Hero metrics are lifetime totals — the week range reads 0 for any
  // account whose activity is older than 7 days.
  const stats = statsData.all ?? statsData.week; // waste stats (lifetime)
  const recentLogs = stats?.recentLogs || []; // recent waste logs
  
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', 'active'],
    queryFn: async () => {
      const res = await getActiveChallenges();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [events,     setEvents]     = useState([]);     // upcoming events
  const [profile,    setProfile]    = useState(null);   // user profile

  // Daily Check-in Badge — shows ONCE per day via localStorage.
  // KEY VERSIONED (v2) to force-reset for ALL users, so everyone sees
  // the redesigned streak-flame card once regardless of prior state.
  const BADGE_KEY = 'daily_badge_shown_date_v2';
  const [showBadge, setShowBadge] = useState(() => {
    try {
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem(BADGE_KEY);
      if (lastShown !== today) {
        localStorage.setItem(BADGE_KEY, today);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eventsRes, profileRes] = await Promise.allSettled([
          getUpcomingEvents(),
          getProfile()
        ]);

        if (eventsRes.status === 'fulfilled')     setEvents(eventsRes.value.data);
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
          updateUser(profileRes.value.data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Auto-dismiss badge after 35s
  useEffect(() => {
    if (!showBadge) return;
    const t = setTimeout(() => {
      localStorage.setItem(BADGE_KEY, new Date().toDateString());
      setShowBadge(false);
    }, 35000);
    return () => clearTimeout(t);
  }, [showBadge]);

  const handleCloseBadge = () => {
    sessionStorage.setItem('badge_shown', '1');
    setShowBadge(false);
  };

  // Auto-rotate facts every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex(i => (i + 1) % WASTE_FACT_KEYS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevFact = (e) => {
    if (e) e.stopPropagation();
    setFactIndex(i => (i - 1 + WASTE_FACT_KEYS.length) % WASTE_FACT_KEYS.length);
  };

  const nextFact = (e) => {
    if (e) e.stopPropagation();
    setFactIndex(i => (i + 1) % WASTE_FACT_KEYS.length);
  };

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    setActiveSlide(Math.round(el.scrollLeft / el.offsetWidth));
  };

  const scrollToSlide = (idx) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
    setActiveSlide(idx);
  };

  // Computed values from real data
  const ecoScore   = computeEcoScore(stats);
  const ecoPoints  = profile?.ecoPoints  ?? stats?.totalPointsEarned ?? 0;
  const wasteKg    = stats?.totalKg      ?? 0;
  const co2Saved   = stats?.totalCo2Saved ?? 0;
  const userName   = profile?.name?.split(' ')[0] || 'Eco Warrior';

  // Use active challenges for the carousel
  const carouselItems = challenges.map((ch, i) => {
    // Pick a nice nature background based on index
    const bgImgs = [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80'
    ];
    return {
      id: ch._id,
      tag: t('dashboard.weeklyMission'),
      title: ch.title,
      desc: ch.description || `Complete tasks and earn ${ch.rewardPoints || 100} eco points.`,
      progress: ch.userProgress?.percentCompleted || 0,
      participants: '—',
      img: bgImgs[i % bgImgs.length],
      _raw: ch,
    };
  });

  const catLabel = (cat) => {
    const key = String(cat || '').toLowerCase();
    const map = {
      dry: 'catDry', wet: 'catWet', ewaste: 'catEwaste', 'e-waste': 'catEwaste',
      hazardous: 'catHazardous', plastic: 'catPlastic', paper: 'catPaper',
      metal: 'catMetal', organic: 'catOrganic',
    };
    return t(`dashboard.${map[key] || 'catOther'}`);
  };

  // Build activity feed from the user's own recent logs.
  // No demo/fallback entries — a new account correctly shows an empty state.
  const activityFeed = recentLogs.map((log) => ({
    id: log._id,
    icon: 'recycling',
    iconColor: 'var(--primary)',
    title: t('dashboard.wasteLogged', { cat: catLabel(log.category) }),
    meta: `${log.unit === 'g' ? (log.quantity / 1000).toFixed(2) : log.quantity.toFixed(1)} kg • ${new Date(log.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`,
    points: `+${log.pointsEarned} ${t('dashboard.pts')}`,
    pointsType: 'positive',
    status: log.pointsEarned > 0 ? t('dashboard.verified') : t('dashboard.pending'),
  }));

  return (
    <div className="dashboard-root">
      <TutorialOverlay />
      <Navbar />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <main className="dashboard-main">

          {/* ── Daily Check-in Badge (streak flame card) */}
          {showBadge && (
            <div className="streak-wrap" onClick={handleCloseBadge}>
              <div className="streak-card" onClick={e => e.stopPropagation()} role="status">
                <span className="streak-ember streak-ember--1" aria-hidden="true" />
                <span className="streak-ember streak-ember--2" aria-hidden="true" />
                <span className="streak-ember streak-ember--3" aria-hidden="true" />
                <div className="streak-flame" aria-hidden="true">
                  <span className="material-symbols-outlined">local_fire_department</span>
                </div>
                <div className="streak-body">
                  <p className="streak-eyebrow">{t('dashboard.badgeTitle')}</p>
                  <h4 className="streak-hello">{t('dashboard.badgeWelcome', { name: userName })}</h4>
                  <p className="streak-sub">{t('dashboard.badgeText')}</p>
                  <span className="streak-points">
                    <span className="material-symbols-outlined" aria-hidden="true">stars</span>
                    {t('dashboard.badgePoints')}
                  </span>
                </div>
                <button className="streak-close" onClick={handleCloseBadge} aria-label={t('dashboard.dismissBadge')}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Immersive Nature Hero ── */}
          <section className="hero-immersive">
            <div className="hero-immersive-bg">
              <div className="hero-glass-sun" />
            </div>
            
            <div className="hero-immersive-content">
              <div className="hero-immersive-top">
                <div className="hi-text-content">
                  <div className="hi-greeting">{t('dashboard.welcomeBack')}</div>
                  <h1 className="hi-title">{userName}</h1>
                  <p className="hi-subtitle">
                    {co2Saved > 0
                      ? t('dashboard.heroSubSaved', { kg: co2Saved.toFixed(1) })
                      : t('dashboard.heroSubStart')}
                  </p>
                  <span className="hi-level-badge">{t('dashboard.level', { n: Math.floor(ecoScore / 20) + 1 })}</span>
                </div>

                <div className="hi-score-ring" onClick={() => navigate('/impact')} role="link" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/impact')}
                  aria-label={t('dashboard.viewImpact')}>
                  <span className="hi-score-val">{ecoScore}</span>
                  <span className="hi-score-lbl">{t('dashboard.ecoScoreCaps')}</span>
                </div>
              </div>

              <div className="hero-immersive-stats">
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                  <span className="hi-stat-val">{ecoPoints.toLocaleString('en-IN')}</span>
                  <span className="hi-stat-lbl">{t('dashboard.points')}</span>
                </div>
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                  <span className="hi-stat-val">{co2Saved.toFixed(1)} kg</span>
                  <span className="hi-stat-lbl">{t('dashboard.co2Saved')}</span>
                </div>
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
                  <span className="hi-stat-val">{wasteKg.toFixed(1)} kg</span>
                  <span className="hi-stat-lbl">{t('dashboard.logged')}</span>
                </div>
              </div>
              <button type="button" className="hi-impact-link" onClick={() => navigate('/impact')}>
                {t('dashboard.viewImpact')}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* ── Daily Fact Strip ── */}
          <div className="daily-fact-strip">
            <button type="button" className="fact-nav-btn" onClick={prevFact} aria-label={t('dashboard.prevFact')}>
              <span className="material-symbols-outlined fact-arrow">chevron_left</span>
            </button>
            <span className="material-symbols-outlined fact-icon">lightbulb</span>
            <p className="fact-text">{t(`dashboard.${WASTE_FACT_KEYS[factIndex]}`)}</p>
            <button type="button" className="fact-nav-btn" onClick={nextFact} aria-label={t('dashboard.nextFact')}>
              <span className="material-symbols-outlined fact-arrow">chevron_right</span>
            </button>
          </div>

          {/* ── Activity Feed + Challenge Carousel */}
          <section className="feed-grid">
            <div className="feed-col">
              <div className="feed-header">
                <h2 className="section-title">{t('dashboard.feedTitle')}</h2>
                <button className="view-all-btn" onClick={() => navigate('/waste-history')}>{t('dashboard.viewAll')}</button>
              </div>
              <div className="activity-list">
                {activityFeed.length > 0 ? activityFeed.map(item => (
                  <div className="activity-item" key={item.id}>
                    <div className="activity-left">
                      <div className="activity-icon-wrap">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: item.iconColor }}>{item.icon}</span>
                      </div>
                      <div className="activity-info">
                        <h4 className="activity-title">{item.title}</h4>
                        <p className="activity-meta">{item.meta}</p>
                      </div>
                    </div>
                    <div className="activity-right">
                      <span className={`activity-points ${item.pointsType === 'negative' ? 'negative' : ''}`}>{item.points}</span>
                      <span className="activity-status">{item.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="eco-empty">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>recycling</span>
                    <h3>{t('dashboard.emptyTitle')}</h3>
                    <p>{t('dashboard.emptySub')}</p>
                    <button className="eco-btn eco-btn--primary eco-btn--sm" onClick={() => navigate('/waste')}>
                      <span className="material-symbols-outlined">add</span>
                      {t('dashboard.logWaste')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="challenge-col">
              <div className="challenge-col-header">
                <h2 className="section-title">{t('dashboard.challTitle')}</h2>
                <span className="challenge-counter">{carouselItems.length > 0 ? `${activeSlide + 1} / ${carouselItems.length}` : '0 / 0'}</span>
              </div>
              {carouselItems.length > 0 ? (
                <>
                  <div className="challenge-carousel" ref={carouselRef} onScroll={handleCarouselScroll}>
                    {carouselItems.map((ch) => (
                      <div className="challenge-slide" key={ch.id}>
                        <div className="challenge-card">
                          <div className="challenge-image-wrapper">
                            <img className="challenge-bg" src={ch.img} alt={ch.title} />
                            <span className="challenge-tag">{ch.tag}</span>
                          </div>
                          <div className="challenge-content">
                            <h3 className="challenge-title">{ch.title}</h3>
                            <p className="challenge-desc">{ch.desc}</p>
                            <div className="challenge-meta-row">
                              <span className="material-symbols-outlined challenge-people-icon">group</span>
                              <span className="challenge-people">{ch.participants}</span>
                            </div>
                            <div className="challenge-progress-bar">
                              <div className="challenge-progress-fill" style={{ width: `${ch.progress}%` }} />
                            </div>
                            <button className="challenge-btn" onClick={() => navigate('/weekly-challenges')}>
                              {t('dashboard.accept')}
                              <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="challenge-dots">
                    {carouselItems.map((_, i) => (
                      <button key={i} className={`challenge-dot${activeSlide === i ? ' active' : ''}`} onClick={() => scrollToSlide(i)} aria-label={t('dashboard.challengeGo', { n: i + 1 })} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="wc-preview-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/weekly-challenges')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--outline)', marginBottom: '8px' }}>emoji_events</span>
                  <h4 className="wc-preview-title" style={{ fontSize: '1rem', marginBottom: '4px' }}>{t('dashboard.noActiveTitle')}</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>{t('dashboard.noActiveSub')}</p>
                  <span className="wc-preview-status not-started">{t('dashboard.explore')}</span>
                </div>
              )}
            </div>
          </section>

          {/* Weekly Challenges Section */}
          <section className="weekly-challenges-section">
            <div className="feed-header">
              <h2 className="section-title">{t('dashboard.weeklyTitle')}</h2>
              <button className="view-all-btn" onClick={() => navigate('/weekly-challenges')}>{t('dashboard.viewAll')}</button>
            </div>
            <div className="weekly-challenges-preview">
              {challenges.slice(0, 2).map((ch, i) => (
                <div key={ch._id} className="wc-preview-card" onClick={() => navigate('/weekly-challenges')}>
                  <div className={`wc-preview-icon-wrap${i > 0 ? ' secondary' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>recycling</span>
                  </div>
                  <div className="wc-preview-info">
                    <h4 className="wc-preview-title">{ch.title}</h4>
                    <div className="wc-preview-bar-wrap">
                      <div className="wc-preview-bar"><div className="wc-preview-fill" style={{ width: `${ch.userProgress?.percentCompleted || 0}%` }} /></div>
                      <span className="wc-preview-pct">{ch.userProgress?.percentCompleted || 0}%</span>
                    </div>
                  </div>
                  <span className={`wc-preview-status ${ch.joined ? 'in-progress' : 'not-started'}`}>
                    {ch.joined ? t('dashboard.inProgress') : t('dashboard.notStarted')}
                  </span>
                </div>
              ))}

              {challenges.length === 0 && (
                <div className="eco-empty">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <h3>{t('dashboard.noWeeklyTitle')}</h3>
                  <p>{t('dashboard.noWeeklySub')}</p>
                  <button className="eco-btn eco-btn--secondary eco-btn--sm" onClick={() => navigate('/weekly-challenges')}>
                    {t('dashboard.exploreLower')}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              )}

              <button className="wc-see-all-btn" onClick={() => navigate('/weekly-challenges')}>
                <span className="material-symbols-outlined">grid_view</span>
                {t('dashboard.seeAllWeekly')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </section>

        </main>
      )}

      <BottomNav />
    </div>
  );
}
