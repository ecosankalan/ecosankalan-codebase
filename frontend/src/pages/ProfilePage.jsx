import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getWasteHistory, updateProfile, uploadAvatar, getProfile, getWasteStreak } from '../services/api';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import StreakLeaf from '../components/common/StreakLeaf';
import '../styles/profile.css';
import { useStats } from '../context/StatsContext';

const formatDisplayName = (name, fallback = 'Eco Warrior') => {
  if (!name || typeof name !== 'string') return fallback;
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const QUIZ_META = {
  'quiz-plastic': { titleKey: 'quizPlastic', icon: 'inventory_2',  badgeKey: 'badgePlastic', color: '#2A7C13' },
  'quiz-organic': { titleKey: 'quizOrganic', icon: 'compost',      badgeKey: 'badgeOrganic', color: '#2A7C13' },
  'quiz-ewaste':  { titleKey: 'quizEwaste',  icon: 'devices_other',badgeKey: 'badgeEwaste',  color: '#7A5B12' },
  'quiz-paper':   { titleKey: 'quizPaper',   icon: 'description',  badgeKey: 'badgePaper',   color: '#2A7C13' },
};

function getQuizResults() {
  try { return JSON.parse(localStorage.getItem('quiz_results') || '{}'); } catch { return {}; }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { statsData } = useStats();
  const stats = statsData.all; // All-time stats
  const quizResults = getQuizResults();
  const completedQuizzes = Object.keys(quizResults).length;
  const totalQuizPoints = Object.values(quizResults).reduce((sum, r) => sum + r.score * 10, 0);

  const [totalLogs, setTotalLogs] = useState(0);
  const [streak, setStreak] = useState(0);

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPic, setEditPic] = useState(user?.avatarUrl || '');
  const [editPicFile, setEditPicFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Escape closes any open modal (a11y)
  useEffect(() => {
    if (!activeModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  useEffect(() => {
    Promise.allSettled([
      getWasteHistory({ limit: 1 }),
      getProfile(),
      getWasteStreak()
    ]).then(([histRes, profileRes, streakRes]) => {
      if (histRes.status === 'fulfilled') setTotalLogs(histRes.value.data.pagination.total);
      if (profileRes.status === 'fulfilled') updateUser(profileRes.value.data);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value.data.currentStreak ?? 0);
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
      if (editPicFile) {
        const formData = new FormData();
        formData.append('avatar', editPicFile);
        await uploadAvatar(formData);
      }
      const updated = await updateProfile({ name: editName });
      if (updated?.data) {
        updateUser(updated.data);
      } else {
        const freshProfile = await getProfile();
        if (freshProfile?.data) updateUser(freshProfile.data);
      }
      setActiveModal(null);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
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

  const colors = ['#2A7C13', '#2A7C13', '#7A5B12']; // primary, secondary, tertiary
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
    { icon: 'verified',       bg: isFirstLog ? 'bg-secondary-fixed' : 'bg-surface-container',   fill: isFirstLog,  title: t('profilePage.firstLog'),   sub: isFirstLog ? t('profilePage.firstLogDone') : t('profilePage.firstLogLocked'),     locked: !isFirstLog },
    { icon: 'fitness_center', bg: is10Kg ? 'bg-primary-fixed' : 'bg-surface-container',         fill: is10Kg,      title: t('profilePage.club10'),     sub: is10Kg ? t('profilePage.club10Done') : t('profilePage.club10Locked'),                 locked: !is10Kg },
    { icon: 'compost',        bg: isSoilMaster ? 'bg-secondary-fixed' : 'bg-surface-container', fill: isSoilMaster, title: t('profilePage.soilMaster'), sub: isSoilMaster ? t('profilePage.soilMasterDone') : t('profilePage.soilMasterLocked', { kg: Math.round(50 - organicKg) }), locked: !isSoilMaster  },
    { icon: 'communities',    bg: 'bg-surface-container',                                       fill: false,       title: t('profilePage.ambassador'), sub: t('profilePage.ambassadorLocked'), locked: true  },
  ];

  const SETTINGS = [
    ...(user?.role === 'admin' ? [{ icon: 'admin_panel_settings', label: t('profilePage.adminDashboard'), action: () => navigate('/admin') }] : []),
    { icon: 'lock',                 label: t('profilePage.privacy'),       action: () => setActiveModal('privacy') },
  ];

  return (
    <div className="profile-root">

      <Navbar />

      <main className="profile-main">

        {/* Hero */}
        <section className="profile-hero-card">
          <div className="profile-hero-glow" />
          <div className="profile-hero-body">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <img src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCumhJLdM5zItnZGoQ9wC0uGI0AHo-Ho56Zvuk0ZsYMY_ZpAshgZtlV-xwAaiOPIO1cS4eIgYWuRrpt0kBibxsP7oBMt1gmkYA62-H-YlKm3I5BOjnOjOZan5n5qiP1D11LqF3SqRuDZEVqz4WJB-cN4zmIBXZTbIJK_E28F_YA8Lu6UFsEBumE0ktFV0vLzheyCIcvofLPMITIgS9D6FTIy6VydfSY8kFzcS9FIarwx7zv6f1CVrMmn7kviwNEpdaNQxf81xvbsPQS"} alt="User Avatar" />
              </div>
              <div className="profile-badge">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '0.875rem' }}>workspace_premium</span>
                LEAF III
              </div>
            </div>
            <div className="profile-hero-info">
              <div className="profile-hero-name-row">
                <h2 className="profile-hero-name">{formatDisplayName(user?.name, t('profilePage.warrior'))}</h2>
              </div>
              <div className="profile-hero-location">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>email</span>
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              {user?.bio && <p className="profile-hero-bio">{user.bio}</p>}
            </div>
            <button className="profile-edit-btn" onClick={() => setActiveModal('edit')}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>edit</span>
              {t('profilePage.editProfile')}
            </button>
          </div>
        </section>

        {/* Stats bento */}
        <div className="profile-bento">
          <div className="profile-stats-grid">
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon primary">analytics</span>
              <div><p className="profile-stat-label">{t('profilePage.totalLogs')}</p><h3 className="profile-stat-val">{totalLogs.toLocaleString()}</h3></div>
            </div>
            <div className="profile-stat-card green">
              <StreakLeaf days={streak} size={30} className="profile-stat-leaf"
                label={t('profilePage.streakLabel')} />
              <div><p className="profile-stat-label muted">{t('profilePage.streakLabel')}</p><h3 className="profile-stat-val">{streak}</h3></div>
            </div>
            <div className="profile-stat-card white">
              <span className="material-symbols-outlined profile-stat-icon secondary">toll</span>
              <div><p className="profile-stat-label">{t('profilePage.points')}</p><h3 className="profile-stat-val">{(user?.ecoPoints || 0).toLocaleString()}</h3></div>
            </div>
            <div className="profile-stat-card red">
              <span className="material-symbols-outlined profile-stat-icon">quiz</span>
              <div><p className="profile-stat-label muted">{t('profilePage.quizzesDone')}</p><h3 className="profile-stat-val">{completedQuizzes}/4</h3></div>
            </div>
          </div>
          <div className="profile-donut-card">
            <h4 className="profile-donut-title">{t('profilePage.wasteBreakdown')}</h4>
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
                  <span style={{ color: 'var(--outline)' }}>{t('profilePage.noWaste')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quiz Progress Section ── */}
        <section className="profile-section">
          <div className="profile-section-header-row">
            <h4 className="profile-section-title">{t('profilePage.quizProgress')}</h4>
            <button type="button" className="profile-quiz-all-btn" onClick={() => navigate('/quiz')}>{t('profilePage.takeQuiz')}</button>
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
                    <h5 className="profile-quiz-name">{t(`profilePage.${meta.titleKey}`)}</h5>
                    {done ? (
                      <>
                        <div className="profile-quiz-bar-wrap">
                          <div className="profile-quiz-bar"><div className="profile-quiz-fill" style={{ width: `${pct}%`, background: meta.color }} /></div>
                          <span className="profile-quiz-pct">{pct}%</span>
                        </div>
                        <span className="profile-quiz-score">{result.score}/{result.total} {t('profilePage.correct')}</span>
                        {badgeEarned && (
                          <span className="profile-quiz-badge-earned">
                            <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            {t(`profilePage.${meta.badgeKey}`)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="profile-quiz-not-done">{t('profilePage.notAttempted')}</span>
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
          <h4 className="profile-section-title">{t('profilePage.achievements')}</h4>
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
            <h4 className="profile-settings-title">{t('profilePage.preferences')}</h4>
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
                <span className="profile-settings-label danger">{t('profilePage.logout')}</span>
              </div>
            </button>
          </div>
        </section>

      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={activeModal === 'edit' ? 'Edit profile' : 'Notifications'} onClick={() => setActiveModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            
            {activeModal === 'edit' && (
              <>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>{t('profilePage.editProfile')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', overflow: 'hidden', background: 'var(--surface-container-highest)', border: '2px solid var(--primary)' }}>
                      <img src={editPic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCumhJLdM5zItnZGoQ9wC0uGI0AHo-Ho56Zvuk0ZsYMY_ZpAshgZtlV-xwAaiOPIO1cS4eIgYWuRrpt0kBibxsP7oBMt1gmkYA62-H-YlKm3I5BOjnOjOZan5n5qiP1D11LqF3SqRuDZEVqz4WJB-cN4zmIBXZTbIJK_E28F_YA8Lu6UFsEBumE0ktFV0vLzheyCIcvofLPMITIgS9D6FTIy6VydfSY8kFzcS9FIarwx7zv6f1CVrMmn7kviwNEpdaNQxf81xvbsPQS"} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <label style={{ fontSize: '0.8rem', color: 'white', fontWeight: '600', cursor: 'pointer', background: 'var(--primary-container)', padding: '0.4rem 0.8rem', borderRadius: '1rem' }}>
                      {t('profilePage.changePicture')}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditPicFile(file);
                            const reader = new FileReader();
                            reader.onload = (event) => setEditPic(event.target.result);
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>{t('profilePage.fullName')}</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--outline)', background: 'var(--surface-container)', color: 'var(--on-surface)' }}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>{t('profilePage.emailLocked')}</label>
                    <input type="text" value={user?.email || ''} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--outline)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '100px', border: 'none', background: 'var(--surface-container)', color: 'var(--on-surface)', fontWeight: 500 }}>{t('profilePage.cancel')}</button>
                    <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '0.75rem', borderRadius: '100px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 500 }}>{isSaving ? t('profilePage.saving') : t('profilePage.save')}</button>
                  </div>
                </div>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('profilePage.privacyTitle')}</h3>
                  <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)' }}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>shield</span>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0' }}>{t('profilePage.dpdpTitle')}</h5>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{t('profilePage.dpdpSub')}</p>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('profilePage.makePublic')}</span>
                    <input type="checkbox" defaultChecked={false} style={{ accentColor: 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('profilePage.shareAnalytics')}</span>
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
