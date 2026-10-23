/**
 * components/common/StreakLeaf.jsx
 * Animated sprout SVG for the daily waste-logging streak.
 *
 * - streak > 0 → lively green sprout: gentle sway, soft glow, twinkling sparks
 * - streak = 0 → greyed-out drooping sprout, fully static
 *
 * The leaf is decorative — callers own the numeric count and label, and
 * should pass `label` for screen readers.
 */
import '../../styles/streak.css';

export default function StreakLeaf({ days = 0, size = 56, label, className = '' }) {
  const active = Number(days) > 0;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`streak-leaf ${active ? 'streak-leaf--active' : 'streak-leaf--idle'} ${className}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="streakLeafActive" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A7C13" />
          <stop offset="100%" stopColor="#76C457" />
        </linearGradient>
        <linearGradient id="streakLeafIdle" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#BDBDBD" />
        </linearGradient>
        <radialGradient id="streakGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#76C457" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#76C457" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#76C457" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient glow — only visible while active */}
      <circle className="streak-glow" cx="32" cy="38" r="24" fill="url(#streakGlow)" />

      {/* twinkling sparks around the sprout — only visible while active */}
      <circle className="streak-spark streak-spark--1" cx="50" cy="18" r="2" fill="#76C457" />
      <circle className="streak-spark streak-spark--2" cx="13" cy="30" r="1.6" fill="#76C457" />
      <circle className="streak-spark streak-spark--3" cx="47" cy="46" r="1.4" fill="#76C457" />

      {/* the sprout — sway/droop transform lives on this group */}
      <g className="streak-plant">
        <path
          className="streak-stem"
          d="M32 60 C 31 51 33 45 35 37"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* main leaf — points up-left from the stem tip */}
        <g transform="translate(35 37) rotate(-42)">
          <path
            className="streak-leaf-shape"
            d="M0 0 C -7 -7 -7 -17 0 -24 C 7 -17 7 -7 0 0 Z"
            strokeWidth="1"
          />
          <path
            className="streak-vein"
            d="M0 -2 L0 -20"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* small leaf — points up-right lower on the stem */}
        <g transform="translate(32.6 48) rotate(54)">
          <path
            className="streak-leaf-shape"
            d="M0 0 C -5 -5 -5 -12 0 -16 C 5 -12 5 -5 0 0 Z"
            strokeWidth="1"
          />
          <path
            className="streak-vein"
            d="M0 -2 L0 -13"
            fill="none"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
