import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWasteStats, getWasteHistory, updateProfile } from '../services/api';
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
  const { user, logout } = useAuth();
  const quizResults = getQuizResults();
  const completedQuizzes = Object.keys(quizResults).length;
  const totalQuizPoints = Object.values(quizResults).reduce((sum, r) => sum + r.score * 10, 0);

  const [stats, setStats] = useState(null);
  const [totalLogs, setTotalLogs] = useState(0);

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [editName, setEditName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      getWasteStats('all'),
      getWasteHistory({ limit: 1 })
    ]).then(([statsRes, histRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (histRes.status === 'fulfilled') setTotalLogs(histRes.value.data.pagination.total);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({ name: editName });
      // In a real app, we'd update AuthContext user object here.
      // For now, reload the page to refresh the context.
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to update profile');
      setIsSaving(false);
    }
  };

  // Donut chart calculations
  const breakdown = stats?.categoryBreakdown || {};
  const totalKg = stats?.totalKg || 1; // Prevent division by zero
  
  // Sort categories by weight descending
  const topCategories = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, kg]) => kg > 0)
    .slice(0, 3); // Top 3

  const colors = ['#1b6d24', '#005127', '#782c39']; // primary, secondary, tertiary
  let dashOffset = 0;
  const slices = topCategories.map(([key, kg], i) => {
    const pct = Math.round((kg / totalKg) * 100);
    const strokeDasharray = `${pct} ${100 - pct}`;
    const currentOffset = dashOffset;
    dashOffset -= pct;
    return { key, kg, pct, color: colors[i % colors.length], strokeDasharray, strokeDashoffset: currentOffset };
  });

  const topCategoryName = topCategories.length > 0 
    ? topCategories[0][0].charAt(0).toUpperCase() + topCategories[0][0].slice(1)
    : 'None';
  const topCategoryPct = topCategories.length > 0 ? slices[0].pct : 0;

  // Build achievements: static ones + quiz badges
  const isFirstLog = totalLogs > 0;
  const is10Kg = (stats?.totalKg || 0) >= 10;
  const organicKg = stats?.categoryBreakdown?.organic || 0;
  const isSoilMaster = organicKg >= 50;

  const ACHIEVEMENTS = [
    { icon: 'verified',       bg: isFirstLog ? 'bg-secondary-fixed' : 'bg-surface-container',   fill: isFirstLog,  title: 'First Log',    sub: isFirstLog ? 'Started the journey' : 'Locked: Log any waste',     locked: !isFirstLog },
    { icon: 'fitness_center', bg: is10Kg ? 'bg-primary-fixed' : 'bg-surface-container',         fill: is10Kg,      title: '10kg Club',    sub: is10Kg ? 'Significant impact' : 'Locked: Recycle 10kg total',       locked: !is10Kg },
    { icon: 'compost',        bg: isSoilMaster ? 'bg-secondary-fixed' : 'bg-surface-container', fill: isSoilMaster, title: 'Soil Master',  sub: isSoilMaster ? 'Master of compost' : `Locked: ${Math.round(50 - organicKg)}kg organic needed`,  locked: !isSoilMaster  },
    { icon: 'communities',    bg: 'bg-surface-container',                                       fill: false,       title: 'Ambassador',   sub: 'Locked: Invite 5 friends', locked: true  },
  ];

  const SETTINGS = [
    { icon: 'person_edit',          label: 'Edit Profile',  action: () => setActiveModal('edit') },
    { icon: 'notifications_active', label: 'Notifications', action: () => setActiveModal('notifications') },
    { icon: 'lock',                 label: 'Privacy',       action: () => setActiveModal('privacy') },
  ];

  return (
    <div className="profile-root">

      <header className="profile-header">
        <div className="profile-header-left">
          <div className="profile-header-avatar">
            <img src="/logo.png" alt="EcoSankalan Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <h1 className="profile-brand">EcoSankalan</h1>
        </div>
        <button className="profile-notif-btn" onClick={() => setActiveModal('notifications')}>
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
                <h2 className="profile-hero-name">{user?.name || 'Eco Warrior'}</h2>
                <span className="profile-hero-level">LEVEL 5 SUSTAINABILITY HERO</span>
              </div>
              <div className="profile-hero-location">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>email</span>
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <p className="profile-hero-bio">Dedicated to a zero-waste lifestyle since 2022. Turning daily habits into planetary impact.</p>
            </div>
            <button className="profile-edit-btn" onClick={() => setActiveModal('edit')}>
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
              <div><p className="profile-stat-label">Total Logs</p><h3 className="profile-stat-val">{totalLogs.toLocaleString()}</h3></div>
            </div>
            <div className="profile-stat-card green">
              <span className="material-symbols-outlined profile-stat-icon">eco</span>
              <div><p className="profile-stat-label muted">CO₂ Saved</p><h3 className="profile-stat-val">{stats?.totalCo2Saved || 0} kg</h3></div>
            </div>
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon secondary">toll</span>
              <div><p className="profile-stat-label">Points</p><h3 className="profile-stat-val">{(user?.ecoPoints || 0).toLocaleString()}</h3></div>
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
                {slices.map((slice, i) => (
                  <circle 
                    key={i} 
                    cx="18" cy="18" fill="transparent" r="15.915" 
                    stroke={slice.color} 
                    strokeDasharray={slice.strokeDasharray} 
                    strokeDashoffset={slice.strokeDashoffset} 
                    strokeWidth="4" 
                  />
                ))}
              </svg>
              <div className="profile-donut-center">
                <span className="profile-donut-pct">{topCategoryPct}%</span>
                <span className="profile-donut-sub" style={{ fontSize: '0.7rem' }}>{topCategoryName.slice(0, 10)}</span>
              </div>
            </div>
            <div className="profile-donut-legend">
              {slices.length > 0 ? slices.map((slice, i) => (
                <div className="profile-legend-item" key={i}>
                  <div className="profile-legend-dot" style={{ backgroundColor: slice.color }} />
                  <span>{slice.key.charAt(0).toUpperCase() + slice.key.slice(1)} ({slice.pct}%)</span>
                </div>
              )) : (
                <div className="profile-legend-item">
                  <span style={{ color: 'var(--outline)' }}>No waste logged yet</span>
                </div>
              )}
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
            {ACHIEVEMENTS.map(a => (
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
              <button key={s.label} className="profile-settings-row" onClick={s.action}>
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

      {/* MODALS */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            
            {activeModal === 'edit' && (
              <>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Edit Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--outline)', background: 'var(--surface-container)', color: 'var(--on-surface)' }}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>Email (Uneditable)</label>
                    <input type="text" value={user?.email || ''} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--outline)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '100px', border: 'none', background: 'var(--surface-container)', color: 'var(--on-surface)', fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '0.75rem', borderRadius: '100px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 500 }}>{isSaving ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </>
            )}

            {activeModal === 'notifications' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Notifications</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)' }}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>recycling</span>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0' }}>Welcome to EcoSankalan!</h5>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>Start logging your waste to earn EcoPoints and unlock rewards.</p>
                    </div>
                  </div>
                  {totalLogs > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>celebration</span>
                      <div>
                        <h5 style={{ margin: '0 0 0.25rem 0' }}>First Log Milestone</h5>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>You've successfully completed your first log. Keep it up!</p>
                      </div>
                    </div>
                  )}
                  {stats?.categoryBreakdown?.organic >= 50 && (
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>compost</span>
                      <div>
                        <h5 style={{ margin: '0 0 0.25rem 0' }}>Soil Master Unlocked</h5>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>You've composted over 50kg of organic waste.</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Privacy Settings</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)' }}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>shield</span>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0' }}>DPDP Act 2023 Compliant</h5>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>Your personal data is encrypted and securely stored.</p>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Make Profile Public</span>
                    <input type="checkbox" defaultChecked={false} style={{ accentColor: 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Share Analytics Anonymously</span>
                    <input type="checkbox" defaultChecked={true} style={{ accentColor: 'var(--primary)' }} />
                  </div>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
