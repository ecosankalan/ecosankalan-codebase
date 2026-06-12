import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/impact.css';

const TIME_FILTERS = ['Today', 'This Week', 'This Month', 'All Time'];

const WEEK_DATA = {
  labels: ['MON','TUE','WED','THU','FRI','SAT','SUN'],
  plastic:  [4,  6,  3,  8,  5,  4,  10],
  organic:  [8,  10, 6,  12, 9,  5,  14],
  ewaste:   [3,  2,  5,  2,  4,  1,  3],
  other:    [2,  4,  3,  1,  2,  2,  2],
};

const BREAKDOWN = [
  { label: 'Plastic',  pct: 45, color: 'var(--primary)',         stroke: '#005127' },
  { label: 'Organic',  pct: 25, color: 'var(--secondary)',       stroke: '#1b6d24' },
  { label: 'E-waste',  pct: 20, color: 'var(--tertiary)',        stroke: '#782c39' },
  { label: 'Other',    pct: 10, color: 'var(--outline-variant)', stroke: '#bfc9bd' },
];

const R        = 15.9;
const CIRCUM_D = 2 * Math.PI * R;
let cumOffset  = 0;
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
  { icon: 'emoji_events',  label: 'Eco Starter',    desc: 'First log',   earned: true  },
  { icon: 'recycling',     label: 'Recycler',        desc: '10 logs',     earned: true  },
  { icon: 'local_florist', label: 'Green Thumb',     desc: '5 organic',   earned: true  },
  { icon: 'water_drop',    label: 'Water Saver',     desc: '100L saved',  earned: false },
  { icon: 'bolt',          label: 'Energy Wizard',   desc: '50kWh saved', earned: false },
  { icon: 'public',        label: 'Planet Guardian', desc: 'Top 1%',      earned: false },
];

export default function ImpactPage() {
  const [timeFilter, setTimeFilter] = useState('This Week');

  return (
    <div className="impact-root">
      <Navbar />
      <main className="impact-main">

        {/* ── Page Title ─────────────────────────────────────── */}
        <div className="impact-page-header">
          <span className="impact-eyebrow">Your Progress</span>
          <h1 className="impact-title">My Impact</h1>
        </div>

        {/* ── Eco-Score Overview Card ─────────────────────────── */}
        <section className="impact-score-card">
          <div className="impact-score-left">
            <span className="impact-score-eyebrow">Eco-Score</span>
            <div className="impact-score-num-row">
              <span className="impact-score-num">82</span>
              <span className="impact-score-denom">/100</span>
            </div>
            <p className="impact-score-trend">
              <span className="material-symbols-outlined impact-trend-icon">trending_up</span>
              Top 5% of your community
            </p>
          </div>
          <div className="impact-score-ring-wrap">
            <svg viewBox="0 0 100 100" className="impact-score-ring-svg">
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--surface-container-high)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--primary)" strokeWidth="8"
                strokeDasharray="282.7" strokeDashoffset="50.8"
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="impact-score-ring-icon">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
          </div>
          <div className="impact-score-bg-blob" />
        </section>

        {/* ── Stats Grid ──────────────────────────────────────── */}
        <div className="impact-stats-row">
          {[
            { icon: 'delete_sweep', label: 'Total Logged',  value: '42.5 kg', color: 'var(--secondary)'         },
            { icon: 'recycling',    label: 'Recycled',      value: '31.2 kg', color: 'var(--primary)'           },
            { icon: 'savings',      label: 'Eco Points',    value: '2,450',   color: 'var(--primary-container)' },
            { icon: 'local_fire_department', label: 'Streak', value: '14 days', color: 'var(--tertiary)'        },
          ].map(s => (
            <div className="impact-stat-tile" key={s.label}>
              <span className="material-symbols-outlined impact-stat-icon"
                style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <span className="impact-stat-val">{s.value}</span>
              <span className="impact-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Time Filter Chips ───────────────────────────────── */}
        <div className="impact-time-chips">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              className={`impact-time-chip${timeFilter === f ? ' active' : ''}`}
              onClick={() => setTimeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Weekly Bar Chart ────────────────────────────────── */}
        <section className="impact-card">
          <div className="impact-card-header-row">
            <div>
              <h2 className="impact-card-title">Weekly Waste Activity</h2>
              <p className="impact-card-sub">Distribution by material type (kg)</p>
            </div>
            <span className="material-symbols-outlined impact-card-icon-right">bar_chart</span>
          </div>
          <div className="impact-bar-chart">
            {WEEK_DATA.labels.map((day, i) => {
              const p = WEEK_DATA.plastic[i];
              const o = WEEK_DATA.organic[i];
              const e = WEEK_DATA.ewaste[i];
              const m = WEEK_DATA.other[i];
              const total = p + o + e + m;
              return (
                <div className="impact-bar-col-new" key={day}>
                  <div className="impact-bar-stack" style={{ height: `${(total / maxBar) * 100}%` }}>
                    <div style={{ height: `${(m/total)*100}%`, background: 'var(--outline-variant)', borderRadius: '2px 2px 0 0' }} />
                    <div style={{ height: `${(e/total)*100}%`, background: 'var(--tertiary-container)' }} />
                    <div style={{ height: `${(o/total)*100}%`, background: 'var(--secondary)' }} />
                    <div style={{ height: `${(p/total)*100}%`, background: 'rgba(0,81,39,0.8)', borderRadius: '0 0 2px 2px' }} />
                  </div>
                  <span className="impact-bar-lbl">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="impact-legend">
            {[
              { color: 'rgba(0,81,39,0.8)',           label: 'Plastic'  },
              { color: 'var(--secondary)',             label: 'Organic'  },
              { color: 'var(--tertiary-container)',    label: 'E-waste'  },
              { color: 'var(--outline-variant)',       label: 'Other'    },
            ].map(l => (
              <div className="impact-legend-item" key={l.label}>
                <span className="impact-legend-dot" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CO2 Highlight Card ──────────────────────────────── */}
        <section className="impact-co2-card">
          <div className="impact-co2-top">
            <div className="impact-co2-icon-wrap">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div className="impact-co2-badge">
              <span className="material-symbols-outlined">trending_up</span>
              +12.5% vs last month
            </div>
          </div>
          <h3 className="impact-co2-num">188 kg CO₂</h3>
          <p className="impact-co2-sub">Saved this month through conscious disposal</p>
          <div className="impact-co2-meta">
            <div>
              <span className="impact-co2-meta-label">Trees Equivalent</span>
              <span className="impact-co2-meta-val">14 Mature Trees</span>
            </div>
            <div>
              <span className="impact-co2-meta-label">Impact Period</span>
              <span className="impact-co2-meta-val">30 Days Activity</span>
            </div>
          </div>
          <div className="impact-co2-blob" />
        </section>

        {/* ── Waste Breakdown + Stat Tiles ────────────────────── */}
        <div className="impact-breakdown-grid">
          <section className="impact-donut-card">
            <div className="impact-donut-wrap">
              <svg viewBox="0 0 36 36" className="impact-donut-svg">
                {donutSegments.map(seg => (
                  <circle key={seg.label}
                    cx="18" cy="18" r={R} fill="transparent"
                    stroke={seg.stroke} strokeWidth="3"
                    strokeDasharray={`${seg.dash} ${CIRCUM_D}`}
                    strokeDashoffset={seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                ))}
              </svg>
              <span className="impact-donut-center">100%</span>
            </div>
            <div className="impact-donut-legend">
              <h3 className="impact-donut-title">Waste Breakdown</h3>
              {BREAKDOWN.map(b => (
                <div className="impact-donut-row" key={b.label}>
                  <div className="impact-donut-row-left">
                    <span className="impact-donut-dot" style={{ background: b.color }} />
                    <span className="impact-donut-lbl">{b.label}</span>
                  </div>
                  <span className="impact-donut-pct">{b.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="impact-mini-stats">
            {[
              { icon: 'eco',        label: 'CO₂ Saved',     value: '42.3 kg',  color: 'var(--primary)'   },
              { icon: 'water_drop', label: 'Water Saved',   value: '1,240 L',  color: 'var(--secondary)' },
              { icon: 'bolt',       label: 'Energy Saved',  value: '18.7 kWh', color: 'var(--tertiary)'  },
              { icon: 'recycling',  label: 'Diverted',      value: '34.5 kg',  color: 'var(--primary)'   },
            ].map(s => (
              <div className="impact-mini-tile" key={s.label}>
                <span className="material-symbols-outlined impact-mini-icon"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <span className="impact-mini-val">{s.value}</span>
                <span className="impact-mini-lbl">{s.label}</span>
              </div>
            ))}
          </section>
        </div>

        {/* ── Monthly Goal ────────────────────────────────────── */}
        <section className="impact-card">
          <div className="impact-card-header-row">
            <span className="material-symbols-outlined impact-card-icon-left">flag</span>
            <h2 className="impact-card-title">Monthly Goal — 80 kg CO₂</h2>
          </div>
          <div className="impact-goal-bar-wrap">
            <div className="impact-goal-bar">
              <div className="impact-goal-fill" style={{ width: '52.8%' }} />
            </div>
            <span className="impact-goal-pct">42.3 / 80 kg <strong>(53%)</strong></span>
          </div>
          <p className="impact-goal-note">You need <strong>37.7 kg more</strong> this month to hit your goal 🌱</p>
        </section>

        {/* ── Achievements ────────────────────────────────────── */}
        <section className="impact-card">
          <div className="impact-card-header-row">
            <span className="material-symbols-outlined impact-card-icon-left">military_tech</span>
            <h2 className="impact-card-title">Achievements</h2>
          </div>
          <div className="impact-badges-grid">
            {ACHIEVEMENT_TILES.map(b => (
              <div className={`impact-badge-tile${b.earned ? '' : ' locked'}`} key={b.label}>
                <span className="material-symbols-outlined impact-badge-tile-icon"
                  style={b.earned ? { fontVariationSettings: "'FILL' 1" } : {}}>{b.icon}</span>
                <span className="impact-badge-tile-label">{b.label}</span>
                <span className="impact-badge-tile-desc">{b.desc}</span>
                {!b.earned && (
                  <span className="material-symbols-outlined impact-badge-lock">lock</span>
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
