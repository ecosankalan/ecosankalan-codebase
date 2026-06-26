import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import TutorialOverlay from '../components/common/TutorialOverlay';
import { getWasteStats, getActiveChallenges, getUpcomingEvents, getProfile } from '../services/api';
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

  const [factIndex,   setFactIndex]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  // Real data state
  const [stats,      setStats]      = useState(null);   // waste stats
  const [challenges, setChallenges] = useState([]);     // active challenges
  const [events,     setEvents]     = useState([]);     // upcoming events
  const [profile,    setProfile]    = useState(null);   // user profile

  // Daily Check-in Badge — shows ONCE per session via sessionStorage
  const [showBadge, setShowBadge] = useState(() => {
    try {
      return !sessionStorage.getItem('badge_shown');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [statsRes, challengesRes, eventsRes, profileRes] = await Promise.allSettled([
          getWasteStats('week'),
          getActiveChallenges(),
          getUpcomingEvents(),
          getProfile(),
        ]);

        if (statsRes.status === 'fulfilled')      setStats(statsRes.value.data);
        if (challengesRes.status === 'fulfilled') setChallenges(challengesRes.value.data);
        if (eventsRes.status === 'fulfilled')     setEvents(eventsRes.value.data);
        if (profileRes.status === 'fulfilled')    setProfile(profileRes.value.data);
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
      sessionStorage.setItem('badge_shown', '1');
      setShowBadge(false);
    }, 35000);
    return () => clearTimeout(t);
  }, [showBadge]);

  const handleCloseBadge = () => {
    sessionStorage.setItem('badge_shown', '1');
    setShowBadge(false);
  };

  const nextFact = () => setFactIndex(i => (i + 1) % WASTE_FACTS.length);

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
    ? challenges.map(ch => ({
        id: ch._id,
        tag: 'Weekly Mission',
        title: ch.title,
        desc: ch.description || `Complete tasks and earn ${ch.rewardPoints || 100} eco points.`,
        progress: 0,
        participants: '—',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
        _raw: ch,
      }))
    : [
        { id: 1, tag: 'Weekly Mission', title: 'Zero-Plastic Week', desc: 'Join others in avoiding single-use plastics for 7 days.', progress: 65, participants: '1,240', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR' },
        { id: 2, tag: 'Community Event', title: 'Compost Champion', desc: 'Log organic waste every day for 2 weeks and earn 500 bonus points.', progress: 40, participants: '872', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR' },
      ];

  // Recent activity from waste stats — use weekly trend as activity proxy
  const activityFeed = stats?.weeklyTrend?.slice(-3).map((day, i) => ({
    id: i,
    icon: 'recycling',
    iconColor: 'var(--primary)',
    title: `Waste logged — ${day.kg} kg`,
    meta: `${day.date}`,
    points: `+${Math.round(day.kg * 5)} pts`,
    pointsType: 'positive',
    status: 'Verified',
  })) || [
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

          {/* ── Hero: Eco Score + Impact Bento */}
          <section className="hero-grid">
            <div className="eco-score-card">
              <div className="eco-score-top-row">
                <div className="eco-score-left">
                  <div className="circular-progress-medium" />
                  <div>
                    <span className="eco-score-label">ECO SCORE</span>
                    <span className="eco-score-number">{ecoScore}</span>
                  </div>
                </div>
                <span className="level-badge">LEVEL {Math.floor(ecoScore / 20) + 1}</span>
              </div>
              <div className="eco-score-bottom">
                <h2 className="eco-score-title">Green Warrior</h2>
                <p className="eco-score-desc">
                  {co2Saved > 0
                    ? `Your sustainable habits saved ${co2Saved.toFixed(1)} kg of CO₂ this week!`
                    : 'Start logging waste to build your eco score and track your impact.'}
                </p>
                <button className="insights-btn" onClick={() => navigate('/impact')}>
                  View Detailed Insights
                  <span className="material-symbols-outlined">trending_up</span>
                </button>
              </div>
            </div>

            <div className="impact-bento">
              <div className="bento-points">
                <span className="material-symbols-outlined bento-icon">savings</span>
                <div className="bento-points-content">
                  <h3 className="bento-label">Eco Points</h3>
                  <div className="bento-points-row">
                    <span className="bento-big-num">{ecoPoints.toLocaleString('en-IN')}</span>
                    <span className="bento-today">this week</span>
                  </div>
                </div>
              </div>
              <div className="bento-fact">
                <div className="bento-fact-header">
                  <span className="material-symbols-outlined bento-fact-icon">lightbulb</span>
                  <h3 className="bento-fact-title">Waste Management Fact</h3>
                </div>
                <p className="bento-fact-text">{WASTE_FACTS[factIndex]}</p>
                <button className="bento-fact-btn" onClick={nextFact}>
                  Show Another Fact
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div className="bento-small">
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>delete_sweep</span>
                <div className="bento-small-content">
                  <h3 className="bento-small-label">Waste Logged</h3>
                  <span className="bento-small-num">{wasteKg.toFixed(1)} kg</span>
                </div>
              </div>
              <div className="bento-small">
                <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>cloud_done</span>
                <div className="bento-small-content">
                  <h3 className="bento-small-label">CO₂ Saved</h3>
                  <span className="bento-small-num">{co2Saved.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          </section>

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
                      <img className="challenge-bg" src={ch.img} alt={ch.title} />
                      <div className="challenge-overlay" />
                      <div className="challenge-content">
                        <span className="challenge-tag">{ch.tag}</span>
                        <h3 className="challenge-title">{ch.title}</h3>
                        <p className="challenge-desc">{ch.desc}</p>
                        <div className="challenge-meta-row">
                          <span className="material-symbols-outlined challenge-people-icon">group</span>
                          <span className="challenge-people">{ch.participants} joined</span>
                        </div>
                        <div className="challenge-progress-bar">
                          <div className="challenge-progress-fill" style={{ width: `${ch.progress}%` }} />
                        </div>
                        <button className="challenge-btn" onClick={() => navigate('/weekly-challenges')}>Accept Challenge</button>
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
                  <div className="wc-preview-card" onClick={() => navigate('/challenge-progress', { state: { challenge: { tag: 'Weekly Mission', title: 'Zero-Plastic Week', subtitle: 'Zero-Plastic Week', desc: 'Eliminate all single-use plastics from your routine this week.', progress: 60, tasksCompleted: 3, tasksTotal: 5, reward: { points: 80, note: 'Unlock upon completing all tasks.' }, tasks: [] } } })}>
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
