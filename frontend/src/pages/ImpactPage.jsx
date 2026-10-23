import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import StreakLeaf from '../components/common/StreakLeaf';
import { getWasteStreak } from '../services/api';
import '../styles/impact.css';

import { useStats } from '../context/StatsContext';

const TIME_FILTER_KEYS = [
  { key: 'today', labelKey: 'fToday', range: 'week' },
  { key: 'week', labelKey: 'fWeek', range: 'week' },
  { key: 'month', labelKey: 'fMonth', range: 'month' },
  { key: 'all', labelKey: 'fAll', range: 'all' },
];

// Constants for Donut Chart
const R = 15.9;
const CIRCUM_D = 2 * Math.PI * R;

const ACHIEVEMENT_TILES = [
  { icon: 'emoji_events',  labelKey: 'aStarter',  descKey: 'aStarterD', earned: true  },
  { icon: 'recycling',     labelKey: 'aRecycler', descKey: 'aRecyclerD', earned: true  },
  { icon: 'local_florist', labelKey: 'aThumb',    descKey: 'aThumbD',   earned: true  },
  { icon: 'water_drop',    labelKey: 'aWater',    descKey: 'aWaterD',   earned: false },
  { icon: 'bolt',          labelKey: 'aEnergy',   descKey: 'aEnergyD',  earned: false },
  { icon: 'public',        labelKey: 'aPlanet',   descKey: 'aPlanetD',  earned: false },
];

export default function ImpactPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateLocale = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
  const [timeFilter, setTimeFilter] = useState('week');
  const [stats, setStats] = useState(null);
  
  const { fetchStatsForRange } = useStats();
  const [loading, setLoading] = useState(true);

  // Lifetime streak — independent of the time-filter above.
  const { data: streakData } = useQuery({
    queryKey: ['wasteStreak'],
    queryFn: async () => (await getWasteStreak()).data,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      setLoading(true);
      try {
        const range = TIME_FILTER_KEYS.find((f) => f.key === timeFilter)?.range || 'week';

        const dataRes = await fetchStatsForRange(range);
        if (!active) return;

        let data = dataRes ? { ...dataRes } : {};
        // Basic local filtering for "Today"
        if (timeFilter === 'today' && data.weeklyTrend) {
           const today = new Date().toLocaleDateString('en-CA');
           const todayData = data.weeklyTrend.filter(t => t.date && t.date.startsWith(today));

           data = {
              ...data,
              weeklyTrend: todayData,
              totalKg: todayData.reduce((sum, d) => sum + (d.kg || 0), 0),
           }
        }
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        if (active) setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStats();
    return () => { active = false; };
  }, [timeFilter, fetchStatsForRange]);

  // Derived metrics
  const totalKg = stats?.totalKg || 0;
  const totalPoints = stats?.totalPointsEarned || 0;
  const bk = stats?.categoryBreakdown || {};
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const loggedToday = streakData?.loggedToday ?? false;

  // Score
  const ecoScore = Math.max(10, Math.min(100, Math.round((totalKg * 2) + (totalPoints * 0.1))));

  // Breakdown array
  const safeTotal = totalKg || 1;
  const BREAKDOWN = [
    { labelKey: 'catPlastic', pct: Math.round(((bk.plastic || 0) / safeTotal) * 100), color: 'var(--primary)', stroke: '#2A7C13' },
    { labelKey: 'catOrganic', pct: Math.round(((bk.organic || 0) / safeTotal) * 100), color: 'var(--secondary)', stroke: '#2A7C13' },
    { labelKey: 'catEwaste', pct: Math.round((((bk.eWaste || 0) + (bk.metal || 0)) / safeTotal) * 100), color: 'var(--tertiary)', stroke: '#7A5B12' },
    { labelKey: 'catOther',   pct: Math.round((((bk.other || 0) + (bk.paper || 0)) / safeTotal) * 100), color: 'var(--outline-variant)', stroke: '#bfc9bd' },
  ];

  let cumOffset = 0;
  const donutSegments = BREAKDOWN.map(b => {
    const dash = (b.pct / 100) * CIRCUM_D;
    const offset = -cumOffset;
    cumOffset += dash;
    return { ...b, label: t(`impact.${b.labelKey}`), dash, offset };
  });

  // Chart data
  const trend = stats?.weeklyTrend || [];
  const maxBar = Math.max(1, ...trend.map(t => t.kg || 0));

  return (
    <div className="impact-root">
      <Navbar />
      <main className="impact-main">

        <div className="impact-page-header">
          <span className="impact-eyebrow">{t('impact.eyebrow')}</span>
          <h1 className="impact-title">{t('impact.title')}</h1>
        </div>

        <section className="impact-score-card">
          <div className="impact-score-left">
            <span className="impact-score-eyebrow">{t('impact.scoreEyebrow')}</span>
            <div className="impact-score-num-row">
              <span className="impact-score-num">{ecoScore}</span>
              <span className="impact-score-denom">/100</span>
            </div>
            <p className="impact-score-trend">
              <span className="material-symbols-outlined impact-trend-icon">trending_up</span>
              {t('impact.improve')}
            </p>
          </div>
          <div className="impact-score-ring-wrap">
            <svg viewBox="0 0 100 100" className="impact-score-ring-svg">
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--surface-container-high)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="transparent"
                stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={`${(ecoScore / 100) * 282.7} 282.7`}
                strokeDashoffset="0"
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

        <div className="impact-stats-row">
          {[
            { icon: 'delete_sweep', labelKey: 'statLogged',  value: `${totalKg.toLocaleString()} kg`, color: 'var(--secondary)' },
            { streak: true, labelKey: 'statStreak', value: `${currentStreak} ${t('impact.streakDayUnit')}`, color: 'var(--primary)' },
            { icon: 'savings',      labelKey: 'statPoints',    value: totalPoints.toLocaleString(), color: 'var(--primary-container)' },
            { icon: 'recycling',    labelKey: 'statRecyc',   value: `${((bk.plastic || 0) + (bk.paper || 0) + (bk.metal || 0) + (bk.eWaste || 0)).toFixed(1)} kg`, color: 'var(--tertiary)' },
          ].map(s => (
            <div className="impact-stat-tile" key={s.labelKey}>
              {s.streak ? (
                <StreakLeaf days={currentStreak} size={30} className="impact-stat-leaf"
                  label={t(`impact.${s.labelKey}`)} />
              ) : (
                <span className="material-symbols-outlined impact-stat-icon"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              )}
              <span className="impact-stat-val">{s.value}</span>
              <span className="impact-stat-lbl">{t(`impact.${s.labelKey}`)}</span>
            </div>
          ))}
        </div>

        <div className="impact-time-chips">
          {TIME_FILTER_KEYS.map(f => (
            <button
              key={f.key}
              className={`impact-time-chip${timeFilter === f.key ? ' active' : ''}`}
              onClick={() => setTimeFilter(f.key)}
            >
              {t(`impact.${f.labelKey}`)}
            </button>
          ))}
        </div>

        <section className="impact-card">
          <div className="impact-card-header-row">
            <div>
              <h2 className="impact-card-title">{t('impact.cardActivity')}</h2>
              <p className="impact-card-sub">{t('impact.cardSub')}</p>
            </div>
            <span className="material-symbols-outlined impact-card-icon-right">bar_chart</span>
          </div>
          
          <div className="impact-bar-chart">
            {trend.length > 0 ? trend.map((t, i) => {
              const dateLabel = timeFilter === 'week' || timeFilter === 'today'
                ? new Date(t.date || Date.now()).toLocaleDateString(dateLocale, { weekday: 'short' }).toUpperCase()
                : new Date(t.date || Date.now()).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });
              
              const p = t.plastic || 0;
              const o = t.organic || 0;
              const e = (t.eWaste || 0) + (t.metal || 0);
              const m = (t.other || 0) + (t.paper || 0);
              const total = p + o + e + m || 1; // avoid /0

              return (
                <div className="impact-bar-col-new" key={t.date + i}>
                  <div className="impact-bar-stack" style={{ height: `${(total / maxBar) * 100}%` }}>
                    <div style={{ height: `${(m/total)*100}%`, background: 'var(--outline-variant)', borderRadius: '2px 2px 0 0' }} />
                    <div style={{ height: `${(e/total)*100}%`, background: 'var(--tertiary-container)' }} />
                    <div style={{ height: `${(o/total)*100}%`, background: 'var(--secondary)' }} />
                    <div style={{ height: `${(p/total)*100}%`, background: 'rgba(42,124,19,0.8)', borderRadius: '0 0 2px 2px' }} />
                  </div>
                  <span className="impact-bar-lbl">{dateLabel}</span>
                </div>
              );
            }) : (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--outline)', padding: '2rem 0' }}>
                {t('impact.noData')}
              </div>
            )}
          </div>
          <div className="impact-legend">
            {[
              { color: 'rgba(42,124,19,0.8)',           labelKey: 'catPlastic'  },
              { color: 'var(--secondary)',             labelKey: 'catOrganic'  },
              { color: 'var(--tertiary-container)',    labelKey: 'catEwaste'  },
              { color: 'var(--outline-variant)',       labelKey: 'catOther'    },
            ].map(l => (
              <div className="impact-legend-item" key={l.labelKey}>
                <span className="impact-legend-dot" style={{ background: l.color }} />
                <span>{t(`impact.${l.labelKey}`)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="impact-streak-card">
          <div className="impact-streak-top">
            <div className="impact-streak-icon-wrap">
              <StreakLeaf days={currentStreak} size={54} label={t('impact.streakTitle')} />
            </div>
            <div className={`impact-streak-badge${currentStreak > 0 ? '' : ' idle'}`}>
              <span className="material-symbols-outlined">
                {currentStreak > 0 ? (loggedToday ? 'check_circle' : 'schedule') : 'remove'}
              </span>
              {currentStreak > 0
                ? (loggedToday ? t('impact.keepUp') : t('impact.streakAtRisk'))
                : t('impact.streakNone')}
            </div>
          </div>
          <h3 className="impact-streak-num">
            {currentStreak} {t('impact.streakDayUnit')}
          </h3>
          <p className="impact-streak-sub">
            {currentStreak > 0 ? t('impact.streakSub') : t('impact.streakSubNone')}
          </p>
          <div className="impact-streak-meta">
            <div>
              <span className="impact-streak-meta-label">{t('impact.streakLongest')}</span>
              <span className="impact-streak-meta-val">{longestStreak} {t('impact.streakDayUnit')}</span>
            </div>
            <div>
              <span className="impact-streak-meta-label">{t('impact.period')}</span>
              <span className="impact-streak-meta-val">{t(`impact.${TIME_FILTER_KEYS.find((f) => f.key === timeFilter)?.labelKey || 'fWeek'}`)}</span>
            </div>
          </div>
          <div className="impact-streak-blob" />
        </section>

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
              <h3 className="impact-donut-title">{t('impact.breakdown')}</h3>
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
              { streak: true,      labelKey: 'miniStreak',   value: `${currentStreak} ${t('impact.streakDayUnit')}`, color: 'var(--primary)' },
              { icon: 'water_drop', labelKey: 'miniWater',   value: `${Math.round(totalKg * 40)} L`,  color: 'var(--secondary)' },
              { icon: 'bolt',       labelKey: 'miniEnergy',  value: `${Math.round(totalKg * 1.5)} kWh`, color: 'var(--tertiary)'  },
              { icon: 'recycling',  labelKey: 'miniDiverted',      value: `${totalKg} kg`,  color: 'var(--primary)'   },
            ].map(s => (
              <div className="impact-mini-tile" key={s.labelKey}>
                {s.streak ? (
                  <StreakLeaf days={currentStreak} size={26} className="impact-mini-leaf"
                    label={t(`impact.${s.labelKey}`)} />
                ) : (
                  <span className="material-symbols-outlined impact-mini-icon"
                    style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                )}
                <span className="impact-mini-val">{s.value}</span>
                <span className="impact-mini-lbl">{t(`impact.${s.labelKey}`)}</span>
              </div>
            ))}
          </section>
        </div>

        <section className="impact-card">
          <div className="impact-card-header-row">
            <span className="material-symbols-outlined impact-card-icon-left">military_tech</span>
            <h2 className="impact-card-title">{t('impact.achTitle')}</h2>
          </div>
          <div className="impact-badges-grid">
            {ACHIEVEMENT_TILES.map(b => (
              <div className={`impact-badge-tile${b.earned ? '' : ' locked'}`} key={b.labelKey}>
                <span className="material-symbols-outlined impact-badge-tile-icon"
                  style={b.earned ? { fontVariationSettings: "'FILL' 1" } : {}}>{b.icon}</span>
                <span className="impact-badge-tile-label">{t(`impact.${b.labelKey}`)}</span>
                <span className="impact-badge-tile-desc">{t(`impact.${b.descKey}`)}</span>
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
