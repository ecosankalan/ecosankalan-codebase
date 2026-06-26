import '../../styles/skeleton.css';

export default function DashboardSkeleton() {
  return (
    <main className="dashboard-main skeleton-page">

      {/* Hero Grid Skeleton */}
      <section className="hero-grid">

        {/* Eco Score Card skeleton */}
        <div className="eco-score-card">
          <div className="eco-score-top-row">
            <div className="eco-score-left">
              <div className="skel skel-circle" style={{ width: 70, height: 70 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skel skel-line" style={{ width: 60, height: 10 }} />
                <div className="skel skel-line" style={{ width: 48, height: 36 }} />
              </div>
            </div>
            <div className="skel skel-pill" style={{ width: 64, height: 24 }} />
          </div>
          <div className="eco-score-bottom" style={{ gap: 12 }}>
            <div className="skel skel-line" style={{ width: '60%', height: 24 }} />
            <div className="skel skel-line" style={{ width: '90%', height: 14 }} />
            <div className="skel skel-line" style={{ width: '80%', height: 14 }} />
            <div className="skel skel-pill" style={{ width: 160, height: 36 }} />
          </div>
        </div>

        {/* Impact Bento skeleton */}
        <div className="impact-bento">
          <div className="bento-points" style={{ gap: 12 }}>
            <div className="skel skel-circle" style={{ width: 40, height: 40 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skel skel-line" style={{ width: '50%', height: 12 }} />
              <div className="skel skel-line" style={{ width: '70%', height: 28 }} />
            </div>
          </div>
          <div className="bento-fact" style={{ gap: 10 }}>
            <div className="skel skel-line" style={{ width: '40%', height: 14 }} />
            <div className="skel skel-line" style={{ width: '100%', height: 12 }} />
            <div className="skel skel-line" style={{ width: '85%', height: 12 }} />
            <div className="skel skel-line" style={{ width: '60%', height: 12 }} />
          </div>
          <div className="bento-small">
            <div className="skel skel-circle" style={{ width: 32, height: 32 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skel skel-line" style={{ width: '50%', height: 11 }} />
              <div className="skel skel-line" style={{ width: '70%', height: 20 }} />
            </div>
          </div>
          <div className="bento-small">
            <div className="skel skel-circle" style={{ width: 32, height: 32 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skel skel-line" style={{ width: '50%', height: 11 }} />
              <div className="skel skel-line" style={{ width: '70%', height: 20 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Feed + Challenge skeleton */}
      <section className="feed-grid">
        <div className="feed-col">
          <div className="feed-header">
            <div className="skel skel-line" style={{ width: 160, height: 20 }} />
            <div className="skel skel-pill" style={{ width: 60, height: 28 }} />
          </div>
          <div className="activity-list">
            {[1, 2, 3].map(i => (
              <div className="activity-item" key={i}>
                <div className="activity-left">
                  <div className="skel skel-circle" style={{ width: 44, height: 44 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div className="skel skel-line" style={{ width: 140, height: 14 }} />
                    <div className="skel skel-line" style={{ width: 100, height: 11 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div className="skel skel-pill" style={{ width: 52, height: 20 }} />
                  <div className="skel skel-line" style={{ width: 52, height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="challenge-col">
          <div className="skel skel-line" style={{ width: 140, height: 20, marginBottom: 12 }} />
          <div className="skel" style={{ width: '100%', height: 260, borderRadius: '1.5rem' }} />
        </div>
      </section>

      {/* AI Scan scanning indicator overlay */}
      <div className="skeleton-scan-hint">
        <div className="skeleton-scan-pulse">
          <span className="material-symbols-outlined">camera</span>
        </div>
        <p>Loading your eco data…</p>
      </div>

    </main>
  );
}
