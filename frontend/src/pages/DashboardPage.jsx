import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const WASTE_FACTS = [
  'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  'A glass bottle takes up to 1 million years to decompose in a landfill.',
  'Composting food waste reduces methane emissions by up to 50%.',
  'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
  'Plastic bags take 10–1,000 years to decompose in landfills.',
];

// Derive Eco Score from stats (simple formula for now)
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
  const { user, updateUser } = useAuth();
  useFCM(user); // Initialize FCM when the user is available

  const [factIndex,   setFactIndex]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  // Real data state
  const { statsData, loading: statsLoading } = useStats();
  const stats = statsData.week; // waste stats
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

  // Daily Check-in Badge — shows ONCE per day via localStorage
  const [showBadge, setShowBadge] = useState(() => {
    try {
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem('daily_badge_shown_date');
      if (lastShown !== today) {
        localStorage.setItem('daily_badge_shown_date', today);
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
      localStorage.setItem('daily_badge_shown_date', new Date().toDateString());
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
      setFactIndex(i => (i + 1) % WASTE_FACTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevFact = (e) => {
    if (e) e.stopPropagation();
    setFactIndex(i => (i - 1 + WASTE_FACTS.length) % WASTE_FACTS.length);
  };

  const nextFact = (e) => {
    if (e) e.stopPropagation();
    setFactIndex(i => (i + 1) % WASTE_FACTS.length);
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
      tag: 'Weekly Mission',
      title: ch.title,
      desc: ch.description || `Complete tasks and earn ${ch.rewardPoints || 100} eco points.`,
      progress: ch.userProgress?.percentCompleted || 0,
      participants: '—',
      img: bgImgs[i % bgImgs.length],
      _raw: ch,
    };
  });

  // Build activity feed from the user's own recent logs.
  // No demo/fallback entries — a new account correctly shows an empty state.
  const activityFeed = recentLogs.map((log) => ({
    id: log._id,
    icon: 'recycling',
    iconColor: 'var(--primary)',
    title: `${log.category} Waste Logged`,
    meta: `${log.unit === 'g' ? (log.quantity / 1000).toFixed(2) : log.quantity.toFixed(1)} kg • ${new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    points: `+${log.pointsEarned} pts`,
    pointsType: 'positive',
    status: log.pointsEarned > 0 ? 'Verified' : 'Pending',
  }));

  return (
    <div className="dashboard-root">
      <TutorialOverlay />
      <Navbar />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <main className="dashboard-main">

          {/* ── Daily Check-in Badge */}
          {showBadge && (
            <div className="daily-badge-wrap" onClick={handleCloseBadge}>
              <div className="eco-badge" onClick={e => e.stopPropagation()}>
                <div className="eco-icon-wrap">
                  <div className="eco-icon-ring">
                    <span className="material-symbols-outlined eco-badge-logo" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>eco</span>
                  </div>
                </div>
                <div className="eco-content">
                  <h2>DAILY CHECKIN</h2>
                  <h4>Welcome back, {userName}!</h4>
                  <p>Consistency is key to a sustainable lifestyle. Keep going to unlock the "Eco Warrior" badge!</p>
                  <div className="eco-points">
                    <span className="points-dot">✤</span>
                    +10 Eco Points Today
                  </div>
                </div>
                <button className="eco-badge-close" onClick={handleCloseBadge} aria-label="Dismiss badge">
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
                  <div className="hi-greeting">Welcome back</div>
                  <h1 className="hi-title">{userName}</h1>
                  <p className="hi-subtitle">
                    {co2Saved > 0 
                      ? `Your sustainable habits saved ${co2Saved.toFixed(1)} kg of CO₂ this week.` 
                      : 'Start logging waste to build your eco score and track your impact.'}
                  </p>
                  <span className="hi-level-badge">Level {Math.floor(ecoScore / 20) + 1}</span>
                </div>
                
                <div className="hi-score-ring" onClick={() => navigate('/impact')}>
                  <span className="hi-score-val">{ecoScore}</span>
                  <span className="hi-score-lbl">ECO SCORE</span>
                </div>
              </div>

              <div className="hero-immersive-stats">
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                  <span className="hi-stat-val">{ecoPoints.toLocaleString('en-IN')}</span>
                  <span className="hi-stat-lbl">Points</span>
                </div>
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                  <span className="hi-stat-val">{co2Saved.toFixed(1)} kg</span>
                  <span className="hi-stat-lbl">CO₂ Saved</span>
                </div>
                <div className="hi-stat-card">
                  <span className="material-symbols-outlined hi-stat-icon" style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
                  <span className="hi-stat-val">{wasteKg.toFixed(1)} kg</span>
                  <span className="hi-stat-lbl">Logged</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Daily Fact Strip ── */}
          <div className="daily-fact-strip">
            <button type="button" className="fact-nav-btn" onClick={prevFact} aria-label="Previous fact">
              <span className="material-symbols-outlined fact-arrow">chevron_left</span>
            </button>
            <span className="material-symbols-outlined fact-icon">lightbulb</span>
            <p className="fact-text">{WASTE_FACTS[factIndex]}</p>
            <button type="button" className="fact-nav-btn" onClick={nextFact} aria-label="Next fact">
              <span className="material-symbols-outlined fact-arrow">chevron_right</span>
            </button>
          </div>

          {/* ── Activity Feed + Challenge Carousel */}
          <section className="feed-grid">
            <div className="feed-col">
              <div className="feed-header">
                <h2 className="section-title">Recent Activity Feed</h2>
                <button className="view-all-btn" onClick={() => navigate('/waste-history')}>View All</button>
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
                  <div className="activity-item" style={{ cursor: 'default' }}>
                    <div className="activity-left">
                      <div className="activity-icon-wrap">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--outline)' }}>eco</span>
                      </div>
                      <div className="activity-info">
                        <h4 className="activity-title">No activity yet</h4>
                        <p className="activity-meta">Log your first waste entry to get started</p>
                      </div>
                    </div>
                    <div className="activity-right">
                      <button className="view-all-btn" onClick={() => navigate('/waste')}>Log waste</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="challenge-col">
              <div className="challenge-col-header">
                <h2 className="section-title">Current Challenges</h2>
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
                              <span className="challenge-people">{ch.participants} joined</span>
                            </div>
                            <div className="challenge-progress-bar">
                              <div className="challenge-progress-fill" style={{ width: `${ch.progress}%` }} />
                            </div>
                            <button className="challenge-btn" onClick={() => navigate('/weekly-challenges')}>
                              Accept Challenge
                              <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="challenge-dots">
                    {carouselItems.map((_, i) => (
                      <button key={i} className={`challenge-dot${activeSlide === i ? ' active' : ''}`} onClick={() => scrollToSlide(i)} aria-label={`Go to challenge ${i + 1}`} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="wc-preview-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/weekly-challenges')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--outline)', marginBottom: '8px' }}>emoji_events</span>
                  <h4 className="wc-preview-title" style={{ fontSize: '1rem', marginBottom: '4px' }}>No Active Challenges</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>Check back soon for new weekly missions!</p>
                  <span className="wc-preview-status not-started">Explore Challenges</span>
                </div>
              )}
            </div>
          </section>

          {/* Weekly Challenges Section */}
          <section className="weekly-challenges-section">
            <div className="feed-header">
              <h2 className="section-title">Weekly Challenges</h2>
              <button className="view-all-btn" onClick={() => navigate('/weekly-challenges')}>View All</button>
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
                    {ch.joined ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              ))}

              {challenges.length === 0 && (
                <div className="wc-preview-card" style={{ padding: '16px', justifyContent: 'center' }} onClick={() => navigate('/weekly-challenges')}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>No active challenges available right now.</span>
                </div>
              )}

              <button className="wc-see-all-btn" onClick={() => navigate('/weekly-challenges')}>
                <span className="material-symbols-outlined">grid_view</span>
                See All Weekly Challenges
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
