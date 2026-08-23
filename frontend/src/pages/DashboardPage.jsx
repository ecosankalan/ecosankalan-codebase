import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const [challenges, setChallenges] = useState([]);     // active challenges
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
        const [challengesRes, eventsRes, profileRes] = await Promise.allSettled([
          getActiveChallenges(),
          getUpcomingEvents(),
          getProfile()
        ]);

        if (challengesRes.status === 'fulfilled') setChallenges(challengesRes.value.data);
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

  // Use active challenges for the carousel; pad with placeholder if empty
  const carouselItems = challenges.length > 0
    ? challenges.map((ch, i) => {
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
          progress: 0,
          participants: '—',
          img: bgImgs[i % bgImgs.length],
          _raw: ch,
        };
      })
    : [
        { id: 1, tag: 'Weekly Mission', title: 'Zero-Plastic Week', desc: 'Join others in avoiding single-use plastics for 7 days.', progress: 65, participants: '1,240', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80' },
        { id: 2, tag: 'Community Event', title: 'Compost Champion', desc: 'Log organic waste every day for 2 weeks and earn 500 bonus points.', progress: 40, participants: '872', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80' },
      ];

  // Build activity feed from recent logs, with fallback if totally empty
  const activityFeed = recentLogs.length > 0 
    ? recentLogs.map((log) => ({
        id: log._id,
        icon: 'recycling',
        iconColor: 'var(--primary)',
        title: `${log.category} Waste Logged`,
        meta: `${log.unit === 'g' ? (log.quantity / 1000).toFixed(2) : log.quantity.toFixed(1)} kg • ${new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        points: `+${log.pointsEarned} pts`,
        pointsType: 'positive',
        status: log.pointsEarned > 0 ? 'Verified' : 'Pending',
      }))
    : [
    { id: 1, icon: 'recycling', iconColor: 'var(--primary)', title: 'Plastic Bottles Recycled', meta: 'Central Hub • 2 hours ago', points: '+15 pts', pointsType: 'positive', status: 'Verified' },
    { id: 2, icon: 'compost',   iconColor: 'var(--tertiary)', title: 'Organic Waste Logged', meta: 'Home • Yesterday', points: '+8 pts', pointsType: 'positive', status: 'Pending' },
  ];

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
                {activityFeed.map(item => (
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
                ))}
              </div>
            </div>

            <div className="challenge-col">
              <div className="challenge-col-header">
                <h2 className="section-title">Current Challenges</h2>
                <span className="challenge-counter">{activeSlide + 1} / {carouselItems.length}</span>
              </div>
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
                      <div className="wc-preview-bar"><div className="wc-preview-fill" style={{ width: '0%' }} /></div>
                      <span className="wc-preview-pct">0%</span>
                    </div>
                  </div>
                  <span className="wc-preview-status not-started">Not Started</span>
                </div>
              ))}

              {challenges.length === 0 && (
                <>
                  <div className="wc-preview-card" onClick={() => navigate('/weekly-challenges')}>
                    <div className="wc-preview-icon-wrap">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>recycling</span>
                    </div>
                    <div className="wc-preview-info">
                      <h4 className="wc-preview-title">Zero-Plastic Week</h4>
                      <div className="wc-preview-bar-wrap">
                        <div className="wc-preview-bar"><div className="wc-preview-fill" style={{ width: '60%' }} /></div>
                        <span className="wc-preview-pct">60%</span>
                      </div>
                    </div>
                    <span className="wc-preview-status in-progress">In Progress</span>
                  </div>
                </>
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
