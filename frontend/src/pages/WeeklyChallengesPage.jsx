import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/weekly-challenges.css';

const FILTER_TABS = ['All', 'In Progress', 'Not Started', 'Completed'];

const WEEKLY_CHALLENGES = [
  {
    id: 1,
    icon: 'recycling',
    iconBg: 'var(--secondary-container)',
    iconColor: 'var(--on-secondary-container)',
    title: 'Zero-Plastic Week',
    desc: 'Eliminate all single-use plastics from your routine this week. Bring your own bags and bottles.',
    progress: 60,
    status: 'In Progress',
    timeLeft: '3d 12h',
    timeIcon: 'timer',
    timeColor: 'var(--tertiary)',
    points: 80,
    tasks: [
      { id: 1, label: 'Log Organic Waste',      done: true,  pending: false },
      { id: 2, label: 'Watch Disposal Video',   done: true,  pending: false },
      { id: 3, label: 'Attend Community Event', done: false, pending: true,
        sub: 'Join the local cleanup this Saturday.' },
      { id: 4, label: 'Complete Quiz',          done: true,  pending: false },
      { id: 5, label: 'Earn 50 Eco Points',     done: false, pending: false },
    ],
  },
  {
    id: 2,
    icon: 'compost',
    iconBg: 'var(--surface-container-high)',
    iconColor: 'var(--on-surface-variant)',
    title: 'Compost Master',
    desc: 'Start your own home composting bin to reduce organic waste footprint.',
    progress: 0,
    status: 'Not Started',
    timeLeft: null,
    bonusPts: '+100 pts',
    points: 100,
    tasks: [
      { id: 1, label: 'Buy a compost bin',         done: false, pending: false },
      { id: 2, label: 'Add first kitchen scraps',  done: false, pending: false },
      { id: 3, label: 'Log your first compost',    done: false, pending: false },
    ],
  },
  {
    id: 3,
    icon: 'devices',
    iconBg: 'var(--secondary)',
    iconColor: 'white',
    title: 'Tech Recycler',
    desc: 'Properly recycle or donate at least 3 old electronic devices.',
    progress: 100,
    status: 'Completed',
    timeLeft: null,
    points: 120,
    tasks: [
      { id: 1, label: 'Identify old devices',   done: true, pending: false },
      { id: 2, label: 'Drop off at e-waste hub', done: true, pending: false },
      { id: 3, label: 'Log the waste',           done: true, pending: false },
    ],
  },
  {
    id: 4,
    icon: 'water_drop',
    iconBg: 'var(--surface-container)',
    iconColor: 'var(--on-surface-variant)',
    title: 'Water Wise',
    desc: 'Reduce your household water usage by 20% this week.',
    progress: 0,
    status: 'Not Started',
    timeLeft: null,
    bonusPts: '+60 pts',
    points: 60,
    tasks: [
      { id: 1, label: 'Fix leaky taps',           done: false, pending: false },
      { id: 2, label: 'Take shorter showers',     done: false, pending: false },
      { id: 3, label: 'Log daily water usage',    done: false, pending: false },
    ],
  },
  {
    id: 5,
    icon: 'local_florist',
    iconBg: 'var(--primary-container)',
    iconColor: 'var(--on-primary-container)',
    title: 'Green Thumb',
    desc: 'Plant one tree or start an indoor plant this week and share your progress.',
    progress: 35,
    status: 'In Progress',
    timeLeft: '1d 6h',
    timeIcon: 'timer',
    timeColor: '#FF8A00',
    points: 75,
    tasks: [
      { id: 1, label: 'Choose a plant or tree',  done: true,  pending: false },
      { id: 2, label: 'Plant it',                done: false, pending: true,
        sub: 'Document with a photo.' },
      { id: 3, label: 'Share on community feed', done: false, pending: false },
    ],
  },
];

export default function WeeklyChallengesPage() {
  const navigate      = useNavigate();
  const [tab, setTab] = useState('All');

  const visible = tab === 'All'
    ? WEEKLY_CHALLENGES
    : WEEKLY_CHALLENGES.filter(c => c.status === tab);

  return (
    <div className="wc-root">
      <Navbar />

      <main className="wc-main">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="wc-header">
          <button className="wc-back-btn" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <span className="wc-eyebrow">This Week</span>
            <h1 className="wc-title">Weekly Challenges</h1>
            <p className="wc-subtitle">Complete tasks and earn rewards while making a positive impact on the environment.</p>
          </div>
        </div>

        {/* ── Filter tabs ─────────────────────────────────────── */}
        <div className="wc-tabs">
          {FILTER_TABS.map(t => (
            <button
              key={t}
              className={`wc-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Cards grid ──────────────────────────────────────── */}
        <div className="wc-grid">
          {visible.length === 0 && (
            <div className="wc-empty">
              <span className="material-symbols-outlined wc-empty-icon">inbox</span>
              <p>No challenges in this category yet.</p>
            </div>
          )}

          {visible.map(ch => (
            <article
              key={ch.id}
              className={`wc-card${ch.status === 'Completed' ? ' completed' : ''}`}
            >
              {ch.status === 'Completed' && <div className="wc-card-completed-bg" />}

              <div className="wc-card-top-row">
                {/* Icon */}
                <div className="wc-card-icon-wrap"
                  style={{ background: ch.iconBg, color: ch.iconColor }}>
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}>{ch.icon}</span>
                </div>

                {/* Status badge */}
                {ch.timeLeft ? (
                  <div className="wc-badge timer">
                    <span className="material-symbols-outlined wc-badge-icon"
                      style={{ color: ch.timeColor }}>{ch.timeIcon}</span>
                    <span>Ends in: {ch.timeLeft}</span>
                  </div>
                ) : ch.bonusPts ? (
                  <div className="wc-badge bonus">
                    <span className="material-symbols-outlined wc-badge-icon">stars</span>
                    <span>{ch.bonusPts}</span>
                  </div>
                ) : ch.status === 'Completed' ? (
                  <div className="wc-badge done">
                    <span className="material-symbols-outlined wc-badge-icon">check_circle</span>
                    <span>Reward Unlocked</span>
                  </div>
                ) : null}
              </div>

              <h3 className="wc-card-title">{ch.title}</h3>
              <p className="wc-card-desc">{ch.desc}</p>

              {/* Progress bar */}
              <div className={`wc-progress-wrap${ch.status === 'Not Started' ? ' muted' : ''}`}>
                <div className="wc-progress-labels">
                  <span className={`wc-progress-status ${ch.status === 'In Progress' ? 'inprogress' : ch.status === 'Completed' ? 'complete' : 'nostart'}`}>
                    {ch.status}
                  </span>
                  <span className="wc-progress-pct">{ch.progress}%</span>
                </div>
                <div className="wc-progress-bar">
                  <div className="wc-progress-fill" style={{ width: `${ch.progress}%` }} />
                </div>
              </div>

              {/* CTA button */}
              {ch.status === 'Completed' ? (
                <div className="wc-completed-label">Challenge Completed ✓</div>
              ) : ch.status === 'In Progress' ? (
                <button className="wc-btn continue"
                  onClick={() => navigate('/challenge-progress', {
                    state: {
                      challenge: {
                        ...ch,
                        tag: 'Weekly Mission',
                        subtitle: ch.title,
                        desc: ch.desc,
                        tasksCompleted: ch.tasks.filter(t => t.done).length,
                        tasksTotal: ch.tasks.length,
                        reward: { points: ch.points, voucher: `${ch.points > 80 ? '15%' : '10%'} Off EcoStore Voucher`, note: `Unlock upon completing all tasks in the '${ch.title}' challenge.` },
                      }
                    }
                  })}>
                  Continue
                </button>
              ) : (
                <button className="wc-btn start"
                  onClick={() => navigate('/challenge-progress', {
                    state: {
                      challenge: {
                        ...ch,
                        tag: 'Weekly Mission',
                        subtitle: ch.title,
                        desc: ch.desc,
                        tasksCompleted: 0,
                        tasksTotal: ch.tasks.length,
                        reward: { points: ch.points, voucher: '10% Off EcoStore Voucher', note: `Unlock upon completing all tasks in the '${ch.title}' challenge.` },
                      }
                    }
                  })}>
                  Start
                </button>
              )}
            </article>
          ))}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
