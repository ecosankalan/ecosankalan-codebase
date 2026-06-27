import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/quiz.css';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { score = 4, total = 5, time = '1:42', points = 50, quizTitle = 'Eco Quiz', badge = 'Eco Scholar' } = location.state || {};

  const accuracy = Math.round((score / total) * 100);
  const wrong    = total - score;
  const CIRC     = 2 * Math.PI * 70;
  const offset   = CIRC - (accuracy / 100) * CIRC;
  const earnedBadge = accuracy >= 80;

  return (
    <div className="result-root">
      <Navbar />
      <main className="result-main">

        <div className="result-header">
          <h1>Quiz Completed!</h1>
          <p>{quizTitle} • You're making a real difference, one answer at a time.</p>
        </div>

        {/* Badge unlocked banner */}
        {earnedBadge && (
          <div className="result-badge-banner">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#08713a', fontSize: '1.75rem' }}>workspace_premium</span>
            <div>
              <p className="result-badge-title">Badge Unlocked: <strong>{badge}</strong></p>
              <p className="result-badge-sub">Added to your profile achievements!</p>
            </div>
          </div>
        )}

        <div className="result-bento">
          {/* Donut score */}
          <div className="result-score-card">
            <div className="result-donut-wrap">
              <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <circle className="result-donut-bg" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="14" />
                <circle className="result-donut-fill" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={offset} />
              </svg>
              <div className="result-donut-label">
                <span className="result-donut-score">{score}/{total}</span>
                <span className="result-donut-sub">Score</span>
              </div>
            </div>
            <div className="result-accuracy-badge">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              {accuracy}% Accuracy
            </div>
          </div>

          {/* Points */}
          <div className="result-points-card">
            <div className="result-points-top">
              <span className="material-symbols-outlined result-points-icon" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <h3>Impact Level Up!</h3>
              <p>Your knowledge helps reduce carbon footprints in your local community.</p>
            </div>
            <div>
              <div className="result-points-earned">+{points}</div>
              <div className="result-points-label">Eco Points earned</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="result-stats-card">
          <div className="result-stats-grid">
            <div className="result-stat-cell">
              <span className="material-symbols-outlined stat-correct">check_circle</span>
              <span className="result-stat-num">{score}</span>
              <span className="result-stat-label">Correct</span>
            </div>
            <div className="result-stat-cell">
              <span className="material-symbols-outlined stat-incorrect">cancel</span>
              <span className="result-stat-num">{wrong}</span>
              <span className="result-stat-label">Incorrect</span>
            </div>
            <div className="result-stat-cell">
              <span className="material-symbols-outlined stat-time">timer</span>
              <span className="result-stat-num">{time}</span>
              <span className="result-stat-label">Time</span>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button className="result-primary-btn" onClick={() => navigate('/quiz', { replace: true })}>
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
          <button className="result-secondary-btn" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined">person</span>
            View Profile
          </button>
        </div>

        <div className="result-quote">
          <p>"The greatest threat to our planet is the belief that someone else will save it."</p>
          <cite>— Robert Swan</cite>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
