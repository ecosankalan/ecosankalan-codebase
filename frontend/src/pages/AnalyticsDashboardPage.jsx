import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/analytics.css';

const TIME_FILTERS = ['Today', 'This Week', 'This Month', 'All Time'];

const WEEK_DATA = {
  labels: ['MON','TUE','WED','THU','FRI','SAT','SUN'],
  plastic:  [4,  6,  3,  8,  5,  4,  10],
  organic:  [8,  10, 6,  12, 9,  5,  14],
  ewaste:   [3,  2,  5,  2,  4,  1,  3],
  other:    [2,  4,  3,  1,  2,  2,  2],
};

const BREAKDOWN = [
  { label: 'Plastic',  pct: 45, color: 'var(--primary)',            stroke: '#005127' },
  { label: 'Organic',  pct: 25, color: 'var(--secondary)',          stroke: '#1b6d24' },
  { label: 'E-waste',  pct: 20, color: 'var(--tertiary)',           stroke: '#782c39' },
  { label: 'Other',    pct: 10, color: 'var(--outline-variant)',    stroke: '#bfc9bd' },
];

// Compute donut stroke-dashoffset values
const R        = 15.9;
const CIRCUM_D = 2 * Math.PI * R;
let cumOffset   = 0;
const donutSegments = BREAKDOWN.map(b => {
  const dash   = (b.pct / 100) * CIRCUM_D;
  const offset = -cumOffset;
  cumOffset   += dash;
  return { ...b, dash, offset };
});

const maxBar = Math.max(
  ...WEEK_DATA.labels.map((_,i) =>
    WEEK_DATA.plastic[i] + WEEK_DATA.organic[i] + WEEK_DATA.ewaste[i] + WEEK_DATA.other[i]
  )
);

const ACHIEVEMENT_TILES = [
  { icon: 'emoji_events',  label: 'Eco Starter',       desc: 'First log',    earned: true  },
  { icon: 'recycling',     label: 'Recycler',           desc: '10 logs',      earned: true  },
  { icon: 'local_florist', label: 'Green Thumb',        desc: '5 organic',    earned: true  },
  { icon: 'water_drop',    label: 'Water Saver',        desc: '100L saved',   earned: false },
  { icon: 'bolt',          label: 'Energy Wizard',      desc: '50kWh saved',  earned: false },
  { icon: 'public',        label: 'Planet Guardian',    desc: 'Top 1%',       earned: false },
];

export default function AnalyticsDashboardPage() {
  const navigate      = useNavigate();
  const [timeFilter, setTimeFilter] = useState('This Week');

  return (
    <div className="an-root">
      <Navbar />

      <main className="an-main">

        {/* ── Back + Title ────────────────────────────────────── */}
        <div className="an-title-row">
          <button className="an-back-btn" onClick={() => navigate('/impact')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <span className="an-eyebrow">Detailed Insights</span>
            <h1 className="an-title">Analytics</h1>
          </div>
        </div>

        {/* ── Eco-Score Overview Card ──────────────────────────── */}
        <section className="an-score-card">
          <div className="an-score-left">
            <div>
              <span className="an-score-eyebrow">Eco-Score</span>
              <div className="an-score-num-row">
                <span className="an-score-num">82</span>
                <span className="an-score-denom">/100</span>
              </div>
              <p className="an-score-trend">
                <span className="material-symbols-outlined an-trend-icon">trending_up</span>
                Top 5% of your community
              </p>
            </div>
          </div>
          <div className="an-score-ring-wrap">
            <svg viewBox="0 0 100 100" className="an-score-ring-svg">
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--surface-container-high)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--primary)" strokeWidth="8"
                strokeDasharray="282.7" strokeDashoffset="50.8"
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="an-score-ring-icon">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
          </div>
          <div className="an-score-bg-blob" />
        </section>

        {/* ── Time Filter Chips ────────────────────────────────── */}
        <div className="an-time-chips">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              className={`an-time-chip${timeFilter === f ? ' active' : ''}`}
              onClick={() => setTimeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Weekly Bar Chart ─────────────────────────────────── */}
        <section className="an-chart-card">
          <div className="an-chart-header">
            <div>
              <h3 className="an-card-title">Weekly Waste Activity</h3>
              <p className="an-card-sub">Distribution by material type (kg)</p>
            </div>
            <span className="material-symbols-outlined an-chart-icon">bar_chart</span>
          </div>

          <div className="an-bar-chart">
            {WEEK_DATA.labels.map((day, i) => {
              const p = WEEK_DATA.plastic[i];
              const o = WEEK_DATA.organic[i];
              const e = WEEK_DATA.ewaste[i];
              const m = WEEK_DATA.other[i];
              const total = p + o + e + m;
              return (
                <div className="an-bar-col" key={day}>
                  <div className="an-bar-stack" style={{ height: `${(total / maxBar) * 100}%` }}>
                    <div style={{ height: `${(m/total)*100}%`, background: 'var(--outline-variant)', borderRadius: '2px 2px 0 0' }} />
                    <div style={{ height: `${(e/total)*100}%`, background: 'var(--tertiary-container)' }} />
                    <div style={{ height: `${(o/total)*100}%`, background: 'var(--secondary)' }} />
                    <div style={{ height: `${(p/total)*100}%`, background: 'rgba(0,81,39,0.8)', borderRadius: '0 0 2px 2px' }} />
                  </div>
                  <span className="an-bar-label">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="an-legend">
            {[
              { color: 'rgba(0,81,39,0.8)',  label: 'Plastic'  },
              { color: 'var(--secondary)',   label: 'Organic'  },
              { color: 'var(--tertiary-container)', label: 'E-waste' },
              { color: 'var(--outline-variant)',    label: 'Other'   },
            ].map(l => (
              <div className="an-legend-item" key={l.label}>
                <span className="an-legend-dot" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CO2 Highlight Card ───────────────────────────────── */}
        <section className="an-co2-card">
          <div className="an-co2-top">
            <div className="an-co2-icon-wrap">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div className="an-co2-badge">
              <span className="material-symbols-outlined">trending_up</span>
              +12.5% vs last month
            </div>
          </div>
          <h3 className="an-co2-num">188 kg CO₂</h3>
          <p className="an-co2-sub">Saved this month through conscious disposal</p>
          <div className="an-co2-meta">
            <div>
              <span className="an-co2-meta-label">Trees Equivalent</span>
              <span className="an-co2-meta-val">14 Mature Trees</span>
            </div>
            <div>
              <span className="an-co2-meta-label">Impact Period</span>
              <span className="an-co2-meta-val">30 Days Activity</span>
            </div>
          </div>
          <div className="an-co2-blob" />
        </section>

        {/* ── Waste Breakdown + Stats ──────────────────────────── */}
        <div className="an-breakdown-grid">
          {/* Donut Chart */}
          <section className="an-donut-card">
            <div className="an-donut-wrap">
              <svg viewBox="0 0 36 36" className="an-donut-svg">
                {donutSegments.map(seg => (
                  <circle key={seg.label}
                    cx="18" cy="18" r={R} fill="transparent"
                    stroke={seg.stroke}
                    strokeWidth="3"
                    strokeDasharray={`${seg.dash} ${CIRCUM_D}`}
                    strokeDashoffset={seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                ))}
              </svg>
              <span className="an-donut-center">100%</span>
            </div>
            <div className="an-donut-legend">
              <h3 className="an-card-title an-card-title-sm">Waste Breakdown</h3>
              {BREAKDOWN.map(b => (
                <div className="an-donut-row" key={b.label}>
                  <div className="an-donut-row-left">
                    <span className="an-donut-dot" style={{ background: b.color }} />
                    <span className="an-donut-lbl">{b.label}</span>
                  </div>
                  <span className="an-donut-pct">{b.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Stat Tiles */}
          <section className="an-stats-col">
            {[
              { icon: 'delete_sweep', label: 'Total Logged',   value: '42.5 kg',  color: 'var(--secondary)' },
              { icon: 'recycling',    label: 'Recycled',       value: '31.2 kg',  color: 'var(--primary)' },
              { icon: 'savings',      label: 'Eco Points',     value: '2,450',    color: 'var(--primary-container)' },
              { icon: 'emoji_events', label: 'Streak',         value: '14 days',  color: 'var(--tertiary)' },
            ].map(s => (
              <div className="an-stat-tile" key={s.label}>
                <span className="material-symbols-outlined an-stat-icon"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div>
                  <span className="an-stat-val">{s.value}</span>
                  <span className="an-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ── Monthly Goal ─────────────────────────────────────── */}
        <section className="an-card">
          <div className="an-card-header">
            <span className="material-symbols-outlined">flag</span>
            <h3 className="an-card-title">Monthly Goal — 80 kg CO₂</h3>
          </div>
          <div className="an-goal-bar-wrap">
            <div className="an-goal-bar">
              <div className="an-goal-fill" style={{ width: '52.8%' }} />
            </div>
            <span className="an-goal-pct">42.3 / 80 kg <strong>(53%)</strong></span>
          </div>
          <p className="an-goal-note">You need <strong>37.7 kg more</strong> this month to hit your goal 🌱</p>
        </section>

        {/* ── Achievements ─────────────────────────────────────── */}
        <section className="an-card">
          <div className="an-card-header">
            <span className="material-symbols-outlined">military_tech</span>
            <h3 className="an-card-title">Achievements</h3>
          </div>
          <div className="an-badges-grid">
            {ACHIEVEMENT_TILES.map(b => (
              <div className={`an-badge${b.earned ? '' : ' locked'}`} key={b.label}>
                <span className="material-symbols-outlined an-badge-icon"
                  style={b.earned ? { fontVariationSettings: "'FILL' 1" } : {}}>{b.icon}</span>
                <span className="an-badge-label">{b.label}</span>
                <span className="an-badge-desc">{b.desc}</span>
                {!b.earned && (
                  <span className="material-symbols-outlined an-badge-lock">lock</span>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
