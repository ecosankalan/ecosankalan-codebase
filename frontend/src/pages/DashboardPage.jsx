import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import '../styles/dashboard.css';
import '../styles/quiz.css'; /* badge-overlay styles live in quiz.css */

const WASTE_FACTS = [
  'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  'A glass bottle takes up to 1 million years to decompose in a landfill.',
  'Composting food waste reduces methane emissions by up to 50%.',
  'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
  'Plastic bags take 10–1,000 years to decompose in landfills.',
];

const ACTIVITY_FEED = [
  {
    id: 1,
    icon: 'recycling',
    iconColor: 'var(--primary)',
    title: 'Plastic Bottles Recycled',
    meta: 'Central Hub • 2 hours ago',
    points: '+15 pts',
    pointsType: 'positive',
    status: 'Verified',
  },
  {
    id: 2,
    icon: 'compost',
    iconColor: 'var(--tertiary)',
    title: 'Organic Waste Logged',
    meta: 'Home • Yesterday',
    points: '+8 pts',
    pointsType: 'positive',
    status: 'Pending',
  },
];

const CHALLENGES = [
  {
    id: 1,
    tag: 'Weekly Mission',
    title: 'Zero-Plastic Week',
    desc: 'Join 1,240 others in avoiding single-use plastics for 7 days.',
    progress: 65,
    participants: '1,240',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
  },
  {
    id: 2,
    tag: 'Community Event',
    title: 'Compost Champion',
    desc: 'Log organic waste every day for 2 weeks and earn 500 bonus points.',
    progress: 40,
    participants: '872',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
  },
  {
    id: 3,
    tag: 'Monthly Goal',
    title: 'E-waste Eliminator',
    desc: 'Drop off at least 1 kg of electronics at a certified recycling hub.',
    progress: 20,
    participants: '456',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
  },
  {
    id: 4,
    tag: 'City Challenge',
    title: 'Clean Gurugram Drive',
    desc: 'Participate in the city\'s neighbourhood cleanup and log your impact.',
    progress: 52,
    participants: '3,100',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
  },
  {
    id: 5,
    tag: 'Weekend Event',
    title: 'Paper-Free Saturday',
    desc: 'Skip all single-use paper products this weekend and log your choices.',
    progress: 80,
    participants: '628',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9u_wNwdnMkBz4r-hoDrkMFQVYK9MWnMHGKrFvD20h04hA--U81RH6ri40Hq0DYzUiG7zqRkImW-i671FOWnKS-_rb5KCGVO5y-7zaWDyTRinlbImtABYllvqjwtnXgAEcK6ul8-KeYD3-NqfLIkpJm06VphtHq9sD4sX_1eU34m7hdt8WevF47PAA-JNuFbkkeptSI0rVBgngC1lL1ME7k5E6-O7VFCAxT6odIh-b0CFHvVEmceSNVes-uYoUkKye-ZhXKAM_ocR',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [factIndex,     setFactIndex]   = useState(0);
  const [loading,       setLoading]     = useState(true);
  const [activeSlide,   setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  // Badge shows only ONCE after login — tracked in sessionStorage
  const [showBadge,  setShowBadge]  = useState(() => {
    const seen = sessionStorage.getItem('badge_shown');
    return !seen;
  });

  useEffect(() => {
    // Simulate async data load (replace with real API call later)
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleCloseBadge = () => {
    sessionStorage.setItem('badge_shown', '1');
    setShowBadge(false);
  };

  const nextFact = () => setFactIndex(i => (i + 1) % WASTE_FACTS.length);

  // Carousel scroll tracking
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveSlide(idx);
  };

  const scrollToSlide = (idx) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
    setActiveSlide(idx);
  };

  return (
    <div className="dashboard-root">
      <Navbar />

      {loading ? (
        <DashboardSkeleton />
      ) : (

      <main className="dashboard-main">

        {/* ── Hero: Compact Eco Score + Impact Bento ───────────── */}
        <section className="hero-grid">

          {/* Eco Score Card — compact */}
          <div className="eco-score-card">
            <div className="eco-score-top-row">
              <div className="eco-score-left">
                <div className="circular-progress-medium" />
                <div>
                  <span className="eco-score-label">ECO SCORE</span>
                  <span className="eco-score-number">82</span>
                </div>
              </div>
              <span className="level-badge">LEVEL 5</span>
            </div>
            <div className="eco-score-bottom">
              <h2 className="eco-score-title">Green Warrior</h2>
              <p className="eco-score-desc">
                You're in the top 5% of your community. Your sustainable
                habits saved 12kg of CO₂ this week!
              </p>
              <button className="insights-btn" onClick={() => navigate('/impact')}>
                View Detailed Insights
                <span className="material-symbols-outlined">trending_up</span>
              </button>
            </div>
          </div>

          {/* Impact bento — right */}
          <div className="impact-bento">

            {/* Eco Points */}
            <div className="bento-points">
              <span className="material-symbols-outlined bento-icon">savings</span>
              <div className="bento-points-content">
                <h3 className="bento-label">Eco Points</h3>
                <div className="bento-points-row">
                  <span className="bento-big-num">2,450</span>
                  <span className="bento-today">+120 today</span>
                </div>
              </div>
            </div>

            {/* Waste Management Fact Card — NEW */}
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

            {/* Waste Logged */}
            <div className="bento-small">
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>
                delete_sweep
              </span>
              <div className="bento-small-content">
                <h3 className="bento-small-label">Waste Logged</h3>
                <span className="bento-small-num">42.5 kg</span>
              </div>
            </div>

            {/* CO2 Saved */}
            <div className="bento-small">
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>
                cloud_done
              </span>
              <div className="bento-small-content">
                <h3 className="bento-small-label">CO₂ Saved</h3>
                <span className="bento-small-num">188 kg</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── Activity Feed + Current Challenge ────────────────── */}
        <section className="feed-grid">

          <div className="feed-col">
            <div className="feed-header">
              <h2 className="section-title">Recent Activity Feed</h2>
              <button className="view-all-btn" onClick={() => navigate('/waste-history')}>View All</button>
            </div>
            <div className="activity-list">
              {ACTIVITY_FEED.map(item => (
                <div className="activity-item" key={item.id}>
                  <div className="activity-left">
                    <div className="activity-icon-wrap">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1", color: item.iconColor }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <div className="activity-info">
                      <h4 className="activity-title">{item.title}</h4>
                      <p className="activity-meta">{item.meta}</p>
                    </div>
                  </div>
                  <div className="activity-right">
                    <span className={`activity-points ${item.pointsType === 'negative' ? 'negative' : ''}`}>
                      {item.points}
                    </span>
                    <span className="activity-status">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="challenge-col">
            <div className="challenge-col-header">
              <h2 className="section-title">Current Challenges</h2>
              <span className="challenge-counter">{activeSlide + 1} / {CHALLENGES.length}</span>
            </div>

            {/* Swipeable Carousel */}
            <div
              className="challenge-carousel"
              ref={carouselRef}
              onScroll={handleCarouselScroll}
            >
              {CHALLENGES.map((ch, idx) => (
                <div className="challenge-slide" key={ch.id}>
                  <div className="challenge-card">
                    <img
                      className="challenge-bg"
                      src={ch.img}
                      alt={ch.title}
                    />
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
                      <button className="challenge-btn" onClick={() => navigate('/challenge-progress', { state: { challenge: ch } })}>Accept Challenge</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="challenge-dots">
              {CHALLENGES.map((_, i) => (
                <button
                  key={i}
                  className={`challenge-dot${activeSlide === i ? ' active' : ''}`}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to challenge ${i + 1}`}
                />
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
            <div className="wc-preview-card" onClick={() => navigate('/challenge-progress', { state: { challenge: {
              tag: 'Weekly Mission',
              title: 'Zero-Plastic Week',
              subtitle: 'Zero-Plastic Week',
              desc: 'Eliminate all single-use plastics from your routine this week. Bring your own bags and bottles.',
              progress: 60,
              tasksCompleted: 3,
              tasksTotal: 5,
              reward: { points: 80, voucher: '10% Off EcoStore Voucher', note: "Unlock upon completing all tasks in the 'Zero-Plastic Week' challenge." },
              tasks: [
                { id: 1, label: 'Log Organic Waste',       done: true,  pending: false },
                { id: 2, label: 'Watch Disposal Video',    done: true,  pending: false },
                { id: 3, label: 'Attend Community Event',  done: false, pending: true, sub: 'Join the local cleanup this Saturday.' },
                { id: 4, label: 'Complete Quiz',           done: true,  pending: false },
                { id: 5, label: 'Earn 50 Eco Points',      done: false, pending: false },
              ],
            }}})}>
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
            <div className="wc-preview-card" onClick={() => navigate('/challenge-progress', { state: { challenge: {
              tag: 'Weekly Mission',
              title: 'Compost Master',
              subtitle: 'Compost Master',
              desc: 'Start your own home composting bin to reduce organic waste footprint.',
              progress: 0,
              tasksCompleted: 0,
              tasksTotal: 3,
              reward: { points: 100, voucher: '15% Off EcoStore Voucher', note: "Unlock upon completing all tasks in the 'Compost Master' challenge." },
              tasks: [
                { id: 1, label: 'Buy a compost bin',        done: false, pending: false },
                { id: 2, label: 'Add first kitchen scraps', done: false, pending: true, sub: 'Document with a photo.' },
                { id: 3, label: 'Log your first compost',   done: false, pending: false },
              ],
            }}})}>
              <div className="wc-preview-icon-wrap secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>compost</span>
              </div>
              <div className="wc-preview-info">
                <h4 className="wc-preview-title">Compost Master</h4>
                <div className="wc-preview-bar-wrap">
                  <div className="wc-preview-bar"><div className="wc-preview-fill" style={{ width: '0%' }} /></div>
                  <span className="wc-preview-pct">0%</span>
                </div>
              </div>
              <span className="wc-preview-status not-started">Not Started</span>
            </div>
            <button className="wc-see-all-btn" onClick={() => navigate('/weekly-challenges')}>
              <span className="material-symbols-outlined">grid_view</span>
              See All Weekly Challenges
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

      </main>
      )} {/* end loading ternary */}

      <BottomNav />

      {/* ── Badge Popup — shown on app open ──────────────────── */}
      {showBadge && (
        <div className="badge-overlay" onClick={handleCloseBadge}>
          <div className="badge-card" onClick={e => e.stopPropagation()}>

            {/* Decorative elements */}
            <div className="badge-card-top-deco" />
            <div className="badge-card-bottom-bar" />

            {/* Close */}
            <button
              className="badge-close-btn"
              onClick={handleCloseBadge}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Unlocked label */}
            <span className="badge-unlocked-label">Achievement Unlocked</span>

            {/* Badge icon */}
            <div className="badge-icon-wrap">
              <div className="badge-icon-glow" />
              <div className="badge-icon-dashed" />
              <div className="badge-icon-circle">
                <div className="badge-icon-inner">
                  <span
                    className="material-symbols-outlined badge-star-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span
                    className="material-symbols-outlined badge-sparkle"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  <div className="badge-eco-bolt">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      eco
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <h2 className="badge-earned-title">You've earned a new badge!</h2>
            <h3 className="badge-name">Segregation Master</h3>
            <p className="badge-desc">
              You've correctly identified and sorted over{' '}
              <strong>50 recyclable items</strong> without a single error.
              Your local ecosystem thanks you.
            </p>

            {/* Actions */}
            <div className="badge-actions">
              <button
                className="badge-continue-btn"
                onClick={handleCloseBadge}
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="badge-share-btn">
                <span className="material-symbols-outlined">share</span>
                Share Achievement
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
