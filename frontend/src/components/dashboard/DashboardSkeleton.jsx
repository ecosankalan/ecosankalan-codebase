import { useState, useEffect } from 'react';
import '../../styles/skeleton.css';

const TIPS = [
  'Fetching your eco score…',
  'Tallying CO₂ you saved…',
  'Polishing your streaks…',
];

export default function DashboardSkeleton() {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="dashboard-main skeleton-page" aria-busy="true" aria-label="Loading dashboard">
      {/* Branded loading header */}
      <div className="skeleton-brand-row">
        <span className="skeleton-leaf-core">
          <span className="material-symbols-outlined">eco</span>
        </span>
        <div className="skeleton-brand-text">
          <p className="skeleton-tip" key={tip}>{TIPS[tip]}</p>
          <div className="skeleton-progress"><span /></div>
        </div>
      </div>

      {/* Hero — mirrors .hero-immersive */}
      <section className="hero-immersive skeleton-hero" aria-hidden="true">
        <div className="hero-immersive-bg" />
        <div className="hero-immersive-content">
          <div className="hero-immersive-top">
            <div className="hi-text-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skel-dark skel-line" style={{ width: 110, height: 12 }} />
              <div className="skel-dark skel-line" style={{ width: 150, height: 30 }} />
              <div className="skel-dark skel-line" style={{ width: '85%', height: 13 }} />
              <div className="skel-dark skel-pill" style={{ width: 74, height: 24 }} />
            </div>
            <div className="skel-dark skel-ring" style={{ width: 90, height: 90 }} />
          </div>
          <div className="hero-immersive-stats">
            {[0, 1, 2].map((i) => (
              <div className="hi-stat-card skeleton-stat-card" key={i} style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                <div className="skel-dark skel-circle" style={{ width: 30, height: 30 }} />
                <div className="skel-dark skel-line" style={{ width: 52, height: 16 }} />
                <div className="skel-dark skel-line" style={{ width: 64, height: 10 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fact strip */}
      <div className="daily-fact-strip skeleton-fact-strip" aria-hidden="true">
        <div className="skel skel-circle" style={{ width: 30, height: 30 }} />
        <div className="skel skel-line" style={{ flex: 1, height: 13 }} />
      </div>

      {/* Feed + challenges */}
      <section className="feed-grid" aria-hidden="true">
        <div className="feed-col">
          <div className="feed-header">
            <div className="skel skel-line" style={{ width: 150, height: 19 }} />
            <div className="skel skel-pill" style={{ width: 62, height: 28 }} />
          </div>
          <div className="activity-list">
            {[0, 1, 2].map((i) => (
              <div className="activity-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="activity-left">
                  <div className="skel skel-circle" style={{ width: 44, height: 44 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div className="skel skel-line" style={{ width: 140, height: 14 }} />
                    <div className="skel skel-line" style={{ width: 100, height: 11 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div className="skel skel-pill" style={{ width: 52, height: 20 }} />
                  <div className="skel skel-line" style={{ width: 52, height: 13 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="challenge-col">
          <div className="skel skel-line" style={{ width: 140, height: 19, marginBottom: 12 }} />
          <div className="skel skeleton-challenge-ph" />
        </div>
      </section>
    </main>
  );
}
