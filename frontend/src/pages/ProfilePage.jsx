import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/common/BottomNav';
import '../styles/profile.css';

const QUIZ_META = {
  'quiz-plastic': { title: 'Plastic Waste',   icon: 'inventory_2',  badge: 'Plastic Expert',     color: '#1b6b3a' },
  'quiz-organic': { title: 'Organic Waste',   icon: 'compost',      badge: 'Compost Champion',   color: '#005127' },
  'quiz-ewaste':  { title: 'E-Waste & Metal', icon: 'devices_other',badge: 'Tech Recycler',      color: '#782c39' },
  'quiz-paper':   { title: 'Paper & Other',   icon: 'description',  badge: 'Paper Sage',         color: '#1b6b3a' },
};

function getQuizResults() {
  try { return JSON.parse(localStorage.getItem('quiz_results') || '{}'); } catch { return {}; }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const quizResults = getQuizResults();
  const completedQuizzes = Object.keys(quizResults).length;
  const totalQuizPoints = Object.values(quizResults).reduce((sum, r) => sum + r.score * 10, 0);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Build achievements: static ones + quiz badges
  const STATIC_ACHIEVEMENTS = [
    { icon: 'verified',       bg: 'bg-secondary-fixed',   iconColor: 'color-on-secondary-fixed', fill: true,  title: 'First Log',    sub: 'Started the journey',     locked: false },
    { icon: 'fitness_center', bg: 'bg-primary-fixed',     iconColor: 'color-on-primary-fixed',   fill: true,  title: '10kg Club',    sub: 'Significant impact',       locked: false },
    { icon: 'compost',        bg: 'bg-surface-container', iconColor: 'color-outline',            fill: false, title: 'Soil Master',  sub: 'Locked: 50 Compost Logs',  locked: true  },
    { icon: 'communities',    bg: 'bg-surface-container', iconColor: 'color-outline',            fill: false, title: 'Ambassador',   sub: 'Locked: Invite 5 friends', locked: true  },
  ];

  const SETTINGS = [
    { icon: 'person_edit',          label: 'Edit Profile',  danger: false },
    { icon: 'notifications_active', label: 'Notifications', danger: false },
    { icon: 'lock',                 label: 'Privacy',       danger: false },
  ];

  return (
    <div className="profile-root">

      <header className="profile-header">
        <div className="profile-header-left">
          <div className="profile-header-avatar">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}>eco</span>
          </div>
          <h1 className="profile-brand">EcoSankalan</h1>
        </div>
        <button className="profile-notif-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="profile-main">

        {/* Hero */}
        <section className="profile-hero-card">
          <div className="profile-hero-glow" />
          <div className="profile-hero-body">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCumhJLdM5zItnZGoQ9wC0uGI0AHo-Ho56Zvuk0ZsYMY_ZpAshgZtlV-xwAaiOPIO1cS4eIgYWuRrpt0kBibxsP7oBMt1gmkYA62-H-YlKm3I5BOjnOjOZan5n5qiP1D11LqF3SqRuDZEVqz4WJB-cN4zmIBXZTbIJK_E28F_YA8Lu6UFsEBumE0ktFV0vLzheyCIcvofLPMITIgS9D6FTIy6VydfSY8kFzcS9FIarwx7zv6f1CVrMmn7kviwNEpdaNQxf81xvbsPQS" alt="User Avatar" />
              </div>
              <div className="profile-badge">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '0.875rem' }}>workspace_premium</span>
                LEAF III
              </div>
            </div>
            <div className="profile-hero-info">
              <div className="profile-hero-name-row">
                <h2 className="profile-hero-name">Eco Warrior</h2>
                <span className="profile-hero-level">LEVEL 5 SUSTAINABILITY HERO</span>
              </div>
              <div className="profile-hero-location">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                <span>Copenhagen, Denmark</span>
              </div>
              <p className="profile-hero-bio">Dedicated to a zero-waste lifestyle since 2022. Turning daily habits into planetary impact.</p>
            </div>
            <button className="profile-edit-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>edit</span>
              Edit Profile
            </button>
          </div>
        </section>

        {/* Stats bento */}
        <div className="profile-bento">
          <div className="profile-stats-grid">
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon primary">analytics</span>
              <div><p className="profile-stat-label">Total Logs</p><h3 className="profile-stat-val">1,284</h3></div>
            </div>
            <div className="profile-stat-card green">
              <span className="material-symbols-outlined profile-stat-icon">eco</span>
              <div><p className="profile-stat-label muted">CO₂ Saved</p><h3 className="profile-stat-val">42.5 kg</h3></div>
            </div>
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon secondary">toll</span>
              <div><p className="profile-stat-label">Points</p><h3 className="profile-stat-val">{(8450 + totalQuizPoints).toLocaleString()}</h3></div>
            </div>
            <div className="profile-stat-card red">
              <span className="material-symbols-outlined profile-stat-icon">quiz</span>
              <div><p className="profile-stat-label muted">Quizzes Done</p><h3 className="profile-stat-val">{completedQuizzes}/4</h3></div>
            </div>
          </div>
          <div className="profile-donut-card">
            <h4 className="profile-donut-title">Waste Breakdown</h4>
            <div className="profile-donut-wrap">
              <svg className="profile-donut-svg" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#eceeec" strokeWidth="4" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#1b6d24" strokeDasharray="45 55" strokeDashoffset="0" strokeWidth="4" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#005127" strokeDasharray="30 70" strokeDashoffset="-45" strokeWidth="4" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#782c39" strokeDasharray="25 75" strokeDashoffset="-75" strokeWidth="4" />
              </svg>
              <div className="profile-donut-center">
                <span className="profile-donut-pct">78%</span>
                <span className="profile-donut-sub">Circular</span>
              </div>
            </div>
            <div className="profile-donut-legend">
              <div className="profile-legend-item"><div className="profile-legend-dot secondary" /><span>Plastic (45%)</span></div>
              <div className="profile-legend-item"><div className="profile-legend-dot primary" /><span>Paper (30%)</span></div>
              <div className="profile-legend-item"><div className="profile-legend-dot tertiary" /><span>Glass (25%)</span></div>
            </div>
          </div>
        </div>

        {/* ── Quiz Progress Section ── */}
        <section className="profile-section">
          <div className="profile-section-header-row">
            <h4 className="profile-section-title">Quiz Progress</h4>
            <button className="profile-quiz-all-btn" onClick={() => navigate('/quiz')}>Take Quiz</button>
          </div>
          <div className="profile-quiz-grid">
            {Object.entries(QUIZ_META).map(([id, meta]) => {
              const result = quizResults[id];
              const pct = result ? Math.round((result.score / result.total) * 100) : 0;
              const done = !!result;
              const badgeEarned = done && pct >= 80;
              return (
                <div key={id} className={`profile-quiz-card${done ? ' done' : ''}`} onClick={() => navigate('/quiz', { state: { quizId: id } })}>
                  <div className="profile-quiz-icon-wrap" style={{ background: meta.color + '18' }}>
                    <span className="material-symbols-outlined" style={{ color: meta.color, fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                  </div>
                  <div className="profile-quiz-info">
                    <h5 className="profile-quiz-name">{meta.title}</h5>
                    {done ? (
                      <>
                        <div className="profile-quiz-bar-wrap">
                          <div className="profile-quiz-bar"><div className="profile-quiz-fill" style={{ width: `${pct}%`, background: meta.color }} /></div>
                          <span className="profile-quiz-pct">{pct}%</span>
                        </div>
                        <span className="profile-quiz-score">{result.score}/{result.total} correct</span>
                        {badgeEarned && (
                          <span className="profile-quiz-badge-earned">
                            <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            {meta.badge}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="profile-quiz-not-done">Not attempted yet</span>
                    )}
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: '1.25rem' }}>
                    {done ? 'check_circle' : 'chevron_right'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <section className="profile-section">
          <h4 className="profile-section-title">Achievements</h4>
          <div className="profile-achievements-grid">
            {STATIC_ACHIEVEMENTS.map(a => (
              <div key={a.title} className={`profile-achievement-card${a.locked ? ' locked' : ''}`}>
                <div className={`profile-achievement-icon ${a.bg}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: a.fill ? "'FILL' 1" : "'FILL' 0", fontSize: '1.875rem', color: a.locked ? 'var(--outline)' : undefined }}>{a.icon}</span>
                </div>
                <div>
                  <h5 className="profile-achievement-name">{a.title}</h5>
                  <p className="profile-achievement-sub">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="profile-settings-card">
          <div className="profile-settings-header">
            <h4 className="profile-settings-title">Preferences &amp; Settings</h4>
          </div>
          <div className="profile-settings-list">
            {SETTINGS.map(s => (
              <button key={s.label} className="profile-settings-row">
                <div className="profile-settings-left">
                  <span className="material-symbols-outlined profile-settings-icon">{s.icon}</span>
                  <span className="profile-settings-label">{s.label}</span>
                </div>
                <span className="material-symbols-outlined profile-settings-chevron">chevron_right</span>
              </button>
            ))}
            <button className="profile-settings-row danger" onClick={handleLogout}>
              <div className="profile-settings-left">
                <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>logout</span>
                <span className="profile-settings-label danger">Logout</span>
              </div>
            </button>
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
