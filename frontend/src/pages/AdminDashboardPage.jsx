import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import {
  getAdminStats,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAdminChallenges,
  getAdminLeaderboard,
  getChallengeLeaderboard,
  broadcastNotification,
  getNotifications,
} from '../services/api';

const todayStr = () => new Date().toISOString().slice(0, 10);

const MEDALS = ['🥇', '🥈', '🥉'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [successMsg, setSuccessMsg] = useState('');

  // Challenges state
  const [challenges, setChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [taskTemplate, setTaskTemplate] = useState({
    description: '',
    action: '',
    category: '',
    imageRequired: true,
    targetCount: 1,
    pointsConfig: { maxPoints: 100, minPoints: 10 },
  });

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [challengeLeaderboards, setChallengeLeaderboards] = useState({});
  const [expandedChallenge, setExpandedChallenge] = useState(null);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    setChallengesLoading(true);
    try {
      const { data } = await getAdminChallenges();
      setChallenges(data);
    } catch (err) {
      setError(err.message || 'Failed to load challenges');
    } finally {
      setChallengesLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const { data } = await getAdminLeaderboard(30);
      setLeaderboard(data);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadChallengeLeaderboard = async (challengeId) => {
    if (challengeLeaderboards[challengeId]) {
      setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId);
      return;
    }
    try {
      const { data } = await getChallengeLeaderboard(challengeId);
      setChallengeLeaderboards((prev) => ({ ...prev, [challengeId]: data }));
      setExpandedChallenge(challengeId);
    } catch (err) {
      setError(err.message || 'Failed to load challenge leaderboard');
    }
  };

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const { data } = await getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      setError('Title and body are required');
      return;
    }
    setSendingNotif(true);
    setError('');
    try {
      const { data } = await broadcastNotification(notifTitle.trim(), notifBody.trim());
      setSuccessMsg(`Notification sent to ${data.notification?.recipientCount || 0} devices`);
      setNotifTitle('');
      setNotifBody('');
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSendingNotif(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'challenges') loadChallenges();
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
      loadChallenges();
    }
    if (activeTab === 'notifications') loadNotifications();
  }, [activeTab]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (!taskTemplate.description.trim()) {
      setError('Task description is required');
      return;
    }
    try {
      await createChallenge({
        title: fd.get('title'),
        description: fd.get('description'),
        startDate: fd.get('startDate'),
        expiryDate: fd.get('expiryDate'),
        taskTemplate: {
          description: taskTemplate.description,
          action: taskTemplate.action || 'daily_task',
          category: taskTemplate.category || null,
          imageRequired: !!taskTemplate.imageRequired,
          targetCount: Number(taskTemplate.targetCount) || 1,
          pointsConfig: {
            maxPoints: Number(taskTemplate.pointsConfig.maxPoints) || 0,
            minPoints: Number(taskTemplate.pointsConfig.minPoints) || 0,
          },
        },
      });
      setSuccessMsg('Challenge created successfully!');
      e.target.reset();
      setTaskTemplate({
        description: '',
        action: '',
        category: '',
        imageRequired: true,
        targetCount: 1,
        pointsConfig: { maxPoints: 100, minPoints: 10 },
      });
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateChallenge = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      title: fd.get('title'),
      description: fd.get('description'),
      startDate: fd.get('startDate'),
      expiryDate: fd.get('expiryDate'),
    };
    payload.taskTemplate = {
      description: taskTemplate.description,
      action: taskTemplate.action || 'daily_task',
      category: taskTemplate.category || null,
      imageRequired: !!taskTemplate.imageRequired,
      targetCount: Number(taskTemplate.targetCount) || 1,
      pointsConfig: {
        maxPoints: Number(taskTemplate.pointsConfig.maxPoints) || 0,
        minPoints: Number(taskTemplate.pointsConfig.minPoints) || 0,
      },
    };
    try {
      await updateChallenge(editingChallenge._id, payload);
      setSuccessMsg('Challenge updated successfully!');
      setEditingChallenge(null);
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm('Deactivate this challenge? It will be hidden from users.')) return;
    try {
      await deleteChallenge(id);
      setSuccessMsg('Challenge deactivated');
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskTemplate = (field, value) => {
    setTaskTemplate((prev) => ({ ...prev, [field]: value }));
  };

  const updatePointsConfig = (field, value) => {
    setTaskTemplate((prev) => ({
      ...prev,
      pointsConfig: { ...prev.pointsConfig, [field]: value },
    }));
  };

  const cardStyle = {
    background: 'var(--surface-container)',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '1rem',
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', marginBottom: '1rem',
    borderRadius: '8px', border: '1px solid var(--outline-variant)',
    background: 'var(--surface)', color: 'var(--on-surface)',
  };

  const TABS = ['stats', 'challenges', 'leaderboard', 'notifications'];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar />
      <main style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--on-surface)' }}>Admin Dashboard</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            User View
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSuccessMsg(''); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                border: 'none',
                background: activeTab === tab ? 'var(--primary)' : 'var(--surface-variant)',
                color: activeTab === tab ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                textTransform: 'capitalize',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="log-error-banner"><span className="material-symbols-outlined">error</span>{error}</div>}
        {successMsg && <div className="vr-alert success"><span className="material-symbols-outlined">check_circle</span>{successMsg}</div>}

        {/* ── Stats Tab ── */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', color: 'var(--on-primary)' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">monitoring</span> Platform Overview
              </h2>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Live analysis of EcoSankalan's impact and engagement.</p>

              {loading ? <p><span className="material-symbols-outlined log-spin">progress_activity</span> Fetching live data...</p> : stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Users</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Waste Logged</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalWasteKg} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>kg</span></p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Events Held</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalEventsConducted}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Active Challenges</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalActiveChallenges}</p>
                  </div>
                </div>
              ) : <p>No data available</p>}
            </div>

            {stats && (
              <div style={cardStyle}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>insights</span> Engagement Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      <span>User Participation Rate</span>
                      <span style={{ fontWeight: 'bold' }}>{Math.min(100, Math.round((stats.totalActiveChallenges / (stats.totalUsers || 1)) * 100))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (stats.totalActiveChallenges / (stats.totalUsers || 1)) * 100)}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      <span>Waste Logs per User</span>
                      <span style={{ fontWeight: 'bold' }}>{(stats.totalWasteKg / (stats.totalUsers || 1)).toFixed(1)} kg</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (stats.totalWasteKg / (stats.totalUsers || 1)) * 10)}%`, height: '100%', background: 'var(--secondary)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={loadStats}
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <span className={`material-symbols-outlined ${loading ? 'log-spin' : ''}`}>sync</span> Refresh Live Data
            </button>
          </div>
        )}

        {/* ── Challenges Tab ── */}
        {activeTab === 'challenges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={cardStyle}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h2>
              <form onSubmit={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}>
                <input name="title" placeholder="Challenge Title" defaultValue={editingChallenge?.title || ''} required style={inputStyle} />
                <textarea name="description" placeholder="Description" defaultValue={editingChallenge?.description || ''} required style={{ ...inputStyle, height: '80px' }} />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input name="startDate" type="date" defaultValue={editingChallenge?.startDate ? editingChallenge.startDate.slice(0, 10) : todayStr()} required style={inputStyle} />
                  <input name="expiryDate" type="date" defaultValue={editingChallenge?.expiryDate ? editingChallenge.expiryDate.slice(0, 10) : ''} required style={inputStyle} />
                </div>

                <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Daily task</p>
                <textarea
                  placeholder="Describe the daily task users must do (e.g. Carry a reusable bottle for the day)"
                  value={taskTemplate.description}
                  onChange={(e) => updateTaskTemplate('description', e.target.value)}
                  maxLength={500}
                  required
                  style={{ ...inputStyle, height: '70px' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input placeholder="Action (optional)" value={taskTemplate.action} onChange={(e) => updateTaskTemplate('action', e.target.value)} style={{ ...inputStyle, marginBottom: '1rem' }} />
                  <input placeholder="Category (optional)" value={taskTemplate.category} onChange={(e) => updateTaskTemplate('category', e.target.value)} style={{ ...inputStyle, marginBottom: '1rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    <input type="checkbox" checked={taskTemplate.imageRequired} onChange={(e) => updateTaskTemplate('imageRequired', e.target.checked)} />
                    Image proof required
                  </label>
                  <input
                    type="number"
                    placeholder="Target count"
                    value={taskTemplate.targetCount}
                    onChange={(e) => updateTaskTemplate('targetCount', parseInt(e.target.value) || 1)}
                    min="1"
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--outline)', display: 'block', marginBottom: '0.25rem' }}>Max points</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={taskTemplate.pointsConfig.maxPoints}
                      onChange={(e) => updatePointsConfig('maxPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--outline)', display: 'block', marginBottom: '0.25rem' }}>Min points (floor)</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={taskTemplate.pointsConfig.minPoints}
                      onChange={(e) => updatePointsConfig('minPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  Points decay linearly over each day's 24-hour window. Earlier submissions earn more.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                  {editingChallenge && (
                    <button type="button" onClick={() => { setEditingChallenge(null); setTaskTemplate({ description: '', action: '', category: '', imageRequired: true, targetCount: 1, pointsConfig: { maxPoints: 100, minPoints: 10 } }); }} style={{ padding: '0.75rem', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>list</span> All Challenges
              </h3>

              {challengesLoading ? (
                <p><span className="material-symbols-outlined log-spin">progress_activity</span> Loading...</p>
              ) : challenges.length === 0 ? (
                <p style={{ color: 'var(--outline)' }}>No challenges created yet.</p>
              ) : (
                challenges.map(ch => (
                  <div key={ch._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', marginBottom: '0.5rem',
                    background: ch.isActive ? 'var(--surface-container)' : 'var(--surface-variant)',
                    borderRadius: '8px', opacity: ch.isActive ? 1 : 0.6,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>
                        {ch.startDate?.slice(0, 10)} → {ch.expiryDate?.slice(0, 10)} | {ch.durationDays || 0} day{ch.durationDays === 1 ? '' : 's'} | {ch.taskTemplate?.pointsConfig?.maxPoints ?? 0} max pts
                        {!ch.isActive && <span style={{ color: 'var(--error)', marginLeft: '0.5rem' }}>(inactive)</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => {
                        setEditingChallenge(ch);
                        if (ch.taskTemplate) {
                          setTaskTemplate({
                            description: ch.taskTemplate.description || '',
                            action: ch.taskTemplate.action || '',
                            category: ch.taskTemplate.category || '',
                            imageRequired: ch.taskTemplate.imageRequired !== false,
                            targetCount: ch.taskTemplate.targetCount || 1,
                            pointsConfig: {
                              maxPoints: ch.taskTemplate.pointsConfig?.maxPoints ?? 100,
                              minPoints: ch.taskTemplate.pointsConfig?.minPoints ?? 10,
                            },
                          });
                        }
                      }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      {ch.isActive && (
                        <button onClick={() => handleDeleteChallenge(ch._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Leaderboard Tab ── */}
        {activeTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Global Leaderboard */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>leaderboard</span>
                Global Leaderboard
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>Top users by total eco-points earned across all activities.</p>

              {leaderboardLoading ? (
                <p><span className="material-symbols-outlined log-spin">progress_activity</span> Loading...</p>
              ) : leaderboard.length === 0 ? (
                <p style={{ color: 'var(--outline)' }}>No users yet.</p>
              ) : (
                <div>
                  {leaderboard.map((u) => (
                    <div key={u._id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0.5rem',
                      borderBottom: '1px solid var(--surface-variant)',
                    }}>
                      <span style={{
                        width: '28px', textAlign: 'center', fontWeight: 800, fontSize: u.rank <= 3 ? '1rem' : '0.85rem',
                        color: u.rank === 1 ? '#FFD700' : u.rank === 2 ? '#C0C0C0' : u.rank === 3 ? '#CD7F32' : 'var(--on-surface-variant)',
                      }}>
                        {u.rank <= 3 ? MEDALS[u.rank - 1] : `#${u.rank}`}
                      </span>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>person</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || 'Anonymous'}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--outline)', margin: 0 }}>
                          {u.totalWasteLogged?.toFixed(1) || 0} kg waste · {u.totalCo2Saved?.toFixed(1) || 0} kg CO₂
                        </p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {u.totalPointsEarned || 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Challenge Leaderboards */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>emoji_events</span>
                Challenge Leaderboards
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>Click a challenge to view its top participants.</p>

              {challengesLoading ? (
                <p><span className="material-symbols-outlined log-spin">progress_activity</span> Loading...</p>
              ) : challenges.length === 0 ? (
                <p style={{ color: 'var(--outline)' }}>No challenges yet.</p>
              ) : (
                challenges.filter(ch => ch.isActive).map(ch => {
                  const lb = challengeLeaderboards[ch._id];
                  const isExpanded = expandedChallenge === ch._id;
                  return (
                    <div key={ch._id} style={{ marginBottom: '0.75rem' }}>
                      <button
                        onClick={() => loadChallengeLeaderboard(ch._id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--surface-variant)',
                          borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{ch.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--outline)', margin: 0 }}>
                            {ch.durationDays || 0} days · {ch.taskTemplate?.pointsConfig?.maxPoints ?? 0} max pts
                          </p>
                        </div>
                        <span className="material-symbols-outlined" style={{
                          transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                          color: 'var(--on-surface-variant)',
                        }}>expand_more</span>
                      </button>

                      {isExpanded && lb && (
                        <div style={{ padding: '0.5rem', marginTop: '0.25rem', background: 'var(--surface)', borderRadius: '8px' }}>
                          {lb.total === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--outline)', padding: '0.5rem' }}>No participants yet.</p>
                          ) : (
                            <>
                              {lb.top10.map((entry) => (
                                <div key={entry.userId?._id || entry.userId} style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.4rem 0.25rem', borderBottom: '1px solid var(--surface-variant)',
                                }}>
                                  <span style={{
                                    width: '22px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem',
                                    color: entry.rank <= 3 ? '#FFD700' : 'var(--on-surface-variant)',
                                  }}>
                                    {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                                  </span>
                                  <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500 }}>
                                    {entry.name || 'User'}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {entry.totalPoints} pts
                                  </span>
                                </div>
                              ))}
                              <p style={{ fontSize: '0.7rem', color: 'var(--outline)', textAlign: 'center', marginTop: '0.5rem' }}>
                                {lb.total} total participant{lb.total === 1 ? '' : 's'}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Send Notification Form */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>notifications_active</span>
                Send Notification
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>
                Broadcast a push notification to all users with registered devices.
              </p>
              <form onSubmit={handleSendNotification}>
                <input
                  placeholder="Notification title"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  maxLength={200}
                  required
                  style={inputStyle}
                />
                <textarea
                  placeholder="Notification body (what users will see)"
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  maxLength={1000}
                  required
                  style={{ ...inputStyle, height: '100px' }}
                />
                <button
                  type="submit"
                  disabled={sendingNotif}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: sendingNotif ? 'var(--surface-variant)' : 'var(--primary)',
                    color: sendingNotif ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                    border: 'none', borderRadius: '8px', cursor: sendingNotif ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  {sendingNotif ? (
                    <><span className="material-symbols-outlined log-spin">progress_activity</span> Sending…</>
                  ) : (
                    <><span className="material-symbols-outlined">send</span> Broadcast to All Users</>
                  )}
                </button>
              </form>
            </div>

            {/* Notification History */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>history</span>
                Sent Notifications
              </h3>

              {notificationsLoading ? (
                <p><span className="material-symbols-outlined log-spin">progress_activity</span> Loading…</p>
              ) : notifications.length === 0 ? (
                <p style={{ color: 'var(--outline)' }}>No notifications sent yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} style={{
                    padding: '0.75rem', marginBottom: '0.5rem',
                    background: 'var(--surface)', borderRadius: '8px',
                    border: '1px solid var(--surface-variant)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, flex: 1 }}>{n.title}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--outline)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                        {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: '0.25rem 0 0.5rem' }}>{n.body}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--outline)' }}>
                      <span>✓ {n.recipientCount} delivered</span>
                      {n.failedCount > 0 && <span style={{ color: 'var(--error)' }}>✗ {n.failedCount} failed</span>}
                      <span>by {n.sentBy?.name || 'Admin'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
