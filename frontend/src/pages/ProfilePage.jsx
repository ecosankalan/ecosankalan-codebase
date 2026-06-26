import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/react';
import BottomNav from '../components/common/BottomNav';
import '../styles/profile.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    navigate('/sign-in', { replace: true });
  };

  const ACHIEVEMENTS = [
    { icon: 'verified',      bg: 'bg-secondary-fixed', iconColor: 'color-on-secondary-fixed', fill: true,  title: 'First Log',   sub: 'Started the journey',      locked: false },
    { icon: 'fitness_center',bg: 'bg-primary-fixed',   iconColor: 'color-on-primary-fixed',   fill: true,  title: '10kg Club',   sub: 'Significant impact',        locked: false },
    { icon: 'compost',       bg: 'bg-surface-container',iconColor: 'color-outline',            fill: false, title: 'Soil Master', sub: 'Locked: 50 Compost Logs',   locked: true  },
    { icon: 'communities',   bg: 'bg-surface-container',iconColor: 'color-outline',            fill: false, title: 'Ambassador',  sub: 'Locked: Invite 5 friends',  locked: true  },
  ];

  const SETTINGS = [
    { icon: 'person_edit',           label: 'Edit Profile',    danger: false },
    { icon: 'notifications_active',  label: 'Notifications',   danger: false },
    { icon: 'lock',                  label: 'Privacy',         danger: false },
  ];

  return (
    <div className="profile-root">

      {/* Top AppBar */}
      <header className="profile-header">
        <div className="profile-header-left">
          <div className="profile-header-avatar">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}
            >
              eco
            </span>
          </div>
          <h1 className="profile-brand">EcoSankalan</h1>
        </div>
        <button className="profile-notif-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="profile-main">

        {/* Hero Profile Section */}
        <section className="profile-hero-card">
          <div className="profile-hero-glow" />
          <div className="profile-hero-body">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCumhJLdM5zItnZGoQ9wC0uGI0AHo-Ho56Zvuk0ZsYMY_ZpAshgZtlV-xwAaiOPIO1cS4eIgYWuRrpt0kBibxsP7oBMt1gmkYA62-H-YlKm3I5BOjnOjOZan5n5qiP1D11LqF3SqRuDZEVqz4WJB-cN4zmIBXZTbIJK_E28F_YA8Lu6UFsEBumE0ktFV0vLzheyCIcvofLPMITIgS9D6FTIy6VydfSY8kFzcS9FIarwx7zv6f1CVrMmn7kviwNEpdaNQxf81xvbsPQS"
                  alt="User Avatar"
                />
              </div>
              <div className="profile-badge">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '0.875rem' }}>workspace_premium</span>
                LEAF III
              </div>
            </div>

            {/* Info */}
            <div className="profile-hero-info">
              <div className="profile-hero-name-row">
                <h2 className="profile-hero-name">Eco Warrior</h2>
                <span className="profile-hero-level">LEVEL 5 SUSTAINABILITY HERO</span>
              </div>
              <div className="profile-hero-location">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                <span>Copenhagen, Denmark</span>
              </div>
              <p className="profile-hero-bio">
                Dedicated to a zero-waste lifestyle since 2022. Turning daily habits into planetary impact.
              </p>
            </div>

            {/* Edit button */}
            <button className="profile-edit-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>edit</span>
              Edit Profile
            </button>
          </div>
        </section>

        {/* Bento Stats + Donut */}
        <div className="profile-bento">
          {/* Stats 2x2 */}
          <div className="profile-stats-grid">
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon primary">analytics</span>
              <div>
                <p className="profile-stat-label">Total Logs</p>
                <h3 className="profile-stat-val">1,284</h3>
              </div>
            </div>
            <div className="profile-stat-card green">
              <span className="material-symbols-outlined profile-stat-icon">eco</span>
              <div>
                <p className="profile-stat-label muted">CO₂ Saved</p>
                <h3 className="profile-stat-val">42.5 kg</h3>
              </div>
            </div>
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon secondary">toll</span>
              <div>
                <p className="profile-stat-label">Points</p>
                <h3 className="profile-stat-val">8,450</h3>
              </div>
            </div>
            <div className="profile-stat-card red">
              <span className="material-symbols-outlined profile-stat-icon">event_available</span>
              <div>
                <p className="profile-stat-label muted">Events</p>
                <h3 className="profile-stat-val">12</h3>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
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
              <div className="profile-legend-item">
                <div className="profile-legend-dot secondary" />
                <span>Plastic (45%)</span>
              </div>
              <div className="profile-legend-item">
                <div className="profile-legend-dot primary" />
                <span>Paper (30%)</span>
              </div>
              <div className="profile-legend-item">
                <div className="profile-legend-dot tertiary" />
                <span>Glass (25%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <section className="profile-section">
          <h4 className="profile-section-title">Achievements</h4>
          <div className="profile-achievements-grid">
            {ACHIEVEMENTS.map(a => (
              <div key={a.title} className={`profile-achievement-card${a.locked ? ' locked' : ''}`}>
                <div className={`profile-achievement-icon ${a.bg}`}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: a.fill ? "'FILL' 1" : "'FILL' 0",
                      fontSize: '1.875rem',
                      color: a.locked ? 'var(--outline)' : undefined,
                    }}
                  >
                    {a.icon}
                  </span>
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
            {/* Logout */}
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
