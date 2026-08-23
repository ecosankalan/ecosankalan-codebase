import { useEffect, useState } from 'react';
import { getChallengeLeaderboard } from '../../services/api';
import '../../styles/challenge-leaderboard.css';

const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%23e0e0e0"/><circle cx="32" cy="26" r="10" fill="%23bdbdbd"/><path d="M12 56c0-11 9-20 20-20s20 9 20 20" fill="%23bdbdbd</svg>';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPanel({ challengeId, currentUserId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!challengeId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data: payload } = await getChallengeLeaderboard(challengeId);
        if (!cancelled) setData(payload);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load leaderboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [challengeId]);

  const renderRow = (row, isCurrent) => (
    <li
      key={`${row.rank}-${row.userId}`}
      className={`lb-row${isCurrent ? ' me' : ''}`}
    >
      <span className="lb-rank">
        {row.rank <= 3 ? (
          <span className="lb-medal">{MEDALS[row.rank - 1]}</span>
        ) : (
          <span className="lb-rank-num">#{row.rank}</span>
        )}
     </span>
      <img
        src={row.avatarUrl || PLACEHOLDER_AVATAR}
        alt={row.name}
        className="lb-avatar"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; }}
      />
      <div className="lb-user">
        <span className="lb-name">
          {row.name}
          {isCurrent && <span className="lb-you"> (you)</span>}
       </span>
        {row.allCompleted && <span className="lb-completed-badge">All days ✓</span>}
     </div>
      <span className="lb-points">
        {row.totalPoints} <small>pts</small>
     </span>
   </li>
  );

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-panel" onClick={(e) => e.stopPropagation()}>
        <div className="lb-header">
          <div>
            <h2 className="lb-title">
              <span className="material-symbols-outlined">leaderboard</span>
              Leaderboard
           </h2>
            <p className="lb-sub">Top 10 + your standing</p>
         </div>
          <button className="lb-close" onClick={onClose} aria-label="Close leaderboard">
            <span className="material-symbols-outlined">close</span>
         </button>
       </div>

        {loading && (
          <div className="lb-state">
            <span className="material-symbols-outlined lb-spin">progress_activity</span>
            Loading…
         </div>
        )}

        {error && (
          <div className="lb-state error">
            <span className="material-symbols-outlined">error</span>
            {error}
         </div>
        )}

        {!loading && !error && data && (
          <>
            {data.top10 && data.top10.length > 0 ? (
              <ol className="lb-list">
                {data.top10.map((row) => renderRow(row, String(row.userId) === String(currentUserId)))}
             </ol>
            ) : (
              <div className="lb-state">
                <span className="material-symbols-outlined">inbox</span>
                No submissions yet. Be the first!
             </div>
            )}

            {data.currentUser && data.currentUser.rank > 10 && (
              <div className="lb-me-card">
                <span className="lb-me-label">Your rank</span>
                <span className="lb-me-rank">#{data.currentUser.rank}</span>
                <span className="lb-me-points">{data.currentUser.totalPoints} pts</span>
             </div>
            )}

            {data.total !== undefined && (
              <p className="lb-footer">
                {data.total} participant{data.total === 1 ? '' : 's'}
             </p>
            )}
          </>
        )}
     </div>
   </div>
  );
}
