import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/challenge-progress.css';

// Default tasks generated when none are supplied (e.g. from carousel)
const DEFAULT_TASKS = [
  { id: 1, label: 'Log your first waste item',      done: true,  pending: false },
  { id: 2, label: 'Watch the challenge intro video', done: true,  pending: false },
  { id: 3, label: 'Attend community event',          done: false, pending: true,
    sub: 'Join the local cleanup this Saturday.' },
  { id: 4, label: 'Complete the challenge quiz',     done: false, pending: false },
  { id: 5, label: 'Earn 50 Eco Points',              done: false, pending: false },
];

export default function ChallengeProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Raw data coming in — may be a full challenge object or a slim carousel item
  const raw = location.state?.challenge ?? {};

  // Normalise: fill every field from raw data or sensible defaults
  const challenge = {
    tag:            raw.tag            ?? 'Weekly Mission',
    subtitle:       raw.subtitle       ?? raw.title ?? 'Challenge Progress',
    desc:           raw.desc           ?? 'Complete all tasks to earn your reward and make an impact.',
    progress:       raw.progress       ?? 0,
    tasksCompleted: raw.tasksCompleted ?? DEFAULT_TASKS.filter(t => t.done).length,
    tasksTotal:     raw.tasksTotal     ?? DEFAULT_TASKS.length,
    reward: {
      points:  raw.reward?.points  ?? raw.points ?? 100,
      voucher: raw.reward?.voucher ?? '10% Off EcoStore Voucher',
      note:    raw.reward?.note    ?? `Unlock upon completing all tasks in the '${raw.title ?? 'challenge'}'.`,
    },
    tasks: (raw.tasks && raw.tasks.length > 0) ? raw.tasks : DEFAULT_TASKS,
  };

  const { tag, subtitle, desc, progress, tasksCompleted, tasksTotal, reward, tasks } = challenge;

  // SVG ring math — rotate -90deg so it starts from the top
  const R      = 45;
  const CIRCUM = 2 * Math.PI * R;
  const offset = CIRCUM - (progress / 100) * CIRCUM;

  return (
    <div className="cp-root">
      <Navbar />

      <main className="cp-main">

        {/* ── Hero: ring + info ───────────────────────────────── */}
        <section className="cp-hero">
          <div className="cp-hero-bg-blob" />

          {/* Circular progress ring */}
          <div className="cp-ring-wrap">
            <svg viewBox="0 0 100 100" className="cp-ring-svg">
              {/* Track */}
              <circle cx="50" cy="50" r={R} fill="none"
                stroke="var(--surface-container-high)" strokeWidth="8" />
              {/* Fill */}
              <circle cx="50" cy="50" r={R} fill="none"
                stroke="var(--primary-container)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="cp-ring-center">
              <span className="cp-ring-pct">{progress}%</span>
              <span className="cp-ring-label">Completed</span>
            </div>
          </div>

          {/* Challenge info */}
          <div className="cp-hero-info">
            <div className="cp-hero-tag">
              <span className="material-symbols-outlined cp-tag-icon"
                style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              {tag}
            </div>
            <h1 className="cp-hero-title">{subtitle}</h1>
            <p className="cp-hero-desc">{desc}</p>
            <p className="cp-tasks-done">
              <span className="material-symbols-outlined cp-tasks-icon">task_alt</span>
              {tasksCompleted}/{tasksTotal} Tasks Completed
            </p>
          </div>
        </section>

        {/* ── Two-column: tasks + rewards ─────────────────────── */}
        <div className="cp-grid">

          {/* Action plan */}
          <section className="cp-tasks-section">
            <h2 className="cp-section-title">
              <span className="material-symbols-outlined">checklist</span>
              Your Action Plan
            </h2>
            <div className="cp-tasks-list">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`cp-task-item${task.done ? ' done' : ''}${task.pending ? ' pending' : ''}`}
                  onClick={() => task.pending && navigate('/event-detail', { state: { challenge: raw } })}
                >
                  {task.pending && <div className="cp-task-accent-bar" />}
                  <div className={`cp-task-check${task.done ? ' checked' : ''}`}>
                    {task.done && (
                      <span className="material-symbols-outlined cp-check-icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </div>
                  <div className="cp-task-body">
                    <h4 className={`cp-task-label${task.done ? ' strikethrough' : ''}`}>
                      {task.label}
                    </h4>
                    {task.sub && <p className="cp-task-sub">{task.sub}</p>}
                  </div>
                  {task.done && <span className="cp-task-done-text">Done</span>}
                  {task.pending && (
                    <span className="material-symbols-outlined cp-task-arrow">arrow_forward_ios</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Rewards + CTA */}
          <section className="cp-rewards-section">
            <h2 className="cp-section-title">
              <span className="material-symbols-outlined cp-reward-trophy">military_tech</span>
              Challenge Rewards
            </h2>

            <div className="cp-reward-card">
              <div className="cp-reward-blob-1" />
              <div className="cp-reward-blob-2" />
              <div className="cp-reward-inner">
                <div className="cp-reward-icon-wrap">
                  <span className="material-symbols-outlined cp-reward-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                </div>
                <h3 className="cp-reward-pts">+{reward.points} Eco Points</h3>
                <p className="cp-reward-voucher">{reward.voucher}</p>
                <p className="cp-reward-note">{reward.note}</p>
              </div>
            </div>

            <button
              className="cp-continue-btn"
              onClick={() => navigate('/event-detail', { state: { challenge: raw } })}
            >
              Continue Challenge
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </section>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
