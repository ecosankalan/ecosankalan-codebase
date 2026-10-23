import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePlatformStats, { formatCompact } from '../../hooks/usePlatformStats';

export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stats, live } = usePlatformStats();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ring fill derived from the REAL warrior count (visual only, capped).
  const ringFill = 213.6 - (213.6 * Math.min(0.92, 0.25 + (stats?.ecoWarriors || 0) / 120));

  return (
    <section className="lp-hero" aria-labelledby="hero-headline">
      {/* ambient background */}
      <div className="lp-hero-bg" aria-hidden="true">
        <span className="lp-orb lp-orb--green" />
        <span className="lp-orb lp-orb--sand" />
        <span className="lp-orb lp-orb--cream" />
        <span className="lp-grain" />
      </div>

      <div className="lp-container lp-hero-grid">
        {/* copy */}
        <div className="lp-hero-copy lp-reveal">
          <p className="lp-pill">
            <span className={`lp-live-dot${live ? ' lp-live-dot--live' : ''}`} aria-hidden="true" />
            {live ? t('landing.liveFrom') : t('landing.joinMovement')}
            <span className="lp-pill-sep" aria-hidden="true">•</span>
            <strong>{formatCompact(stats?.binsMapped)}</strong>&nbsp;{t('landing.binsMapped')}
          </p>

          <h1 id="hero-headline" className="lp-display">
            <span className="lp-line"><span>{t('landing.heroTitleA')}</span></span>
            <span className="lp-line"><em>{t('landing.heroTitleB')}</em></span>
          </h1>

          <p className="lp-lead">{t('landing.heroSub')}</p>

          <div className="lp-hero-ctas">
            <button className="lp-btn lp-btn--primary lp-magnet" onClick={() => navigate('/register')}>
              {t('landing.ctaStart')}
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
            <button className="lp-btn lp-btn--ghost lp-magnet" onClick={() => scrollTo('impact')}>
              <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
              {t('landing.ctaImpact')}
            </button>
          </div>

          <dl className="lp-hero-stats" aria-label="Live platform statistics">
            <div className="lp-hero-stat">
              <dt>{t('landing.statBins')}</dt>
              <dd>{formatCompact(stats?.binsMapped)}</dd>
            </div>
            <div className="lp-hero-stat">
              <dt>{t('landing.statWaste')}</dt>
              <dd>{formatCompact(stats?.wasteKg)}<span>kg</span></dd>
            </div>
            <div className="lp-hero-stat">
              <dt>{t('landing.statPoints')}</dt>
              <dd>{formatCompact(stats?.totalPoints)}</dd>
            </div>
          </dl>
        </div>

        {/* visual */}
        <div className="lp-hero-visual lp-reveal lp-delay-2">
          <div className="lp-preview" role="img" aria-label="Preview of the EcoSankalan dashboard">
            <div className="lp-preview-glow" aria-hidden="true" />
            <div className="lp-preview-head">
              <div>
                <p className="lp-preview-eyebrow">{t('landing.previewWelcome')}</p>
                <p className="lp-preview-title">{t('landing.previewWarrior')}</p>
              </div>
              <div className="lp-preview-ring">
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(42,124,19,.15)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#76C457" strokeWidth="8"
                    strokeDasharray="213.6" strokeDashoffset={ringFill} strokeLinecap="round"
                    transform="rotate(-90 40 40)" className="lp-preview-ring-fill" />
                </svg>
                <div className="lp-preview-ring-center">
                  <strong>{formatCompact(stats?.ecoWarriors)}</strong>
                  <span>{t('landing.previewWarriors')}</span>
                </div>
              </div>
            </div>
            <div className="lp-preview-tiles">
              <div className="lp-preview-tile">
                <span className="material-symbols-outlined" aria-hidden="true">savings</span>
                <strong>{formatCompact(stats?.totalPoints)}</strong>
                <span>{t('landing.previewPoints')}</span>
              </div>
              <div className="lp-preview-tile">
                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                <strong>{formatCompact(stats?.binsMapped)}</strong>
                <span>{t('landing.statBins')}</span>
              </div>
              <div className="lp-preview-tile">
                <span className="material-symbols-outlined" aria-hidden="true">delete_sweep</span>
                <strong>{formatCompact(stats?.wasteKg)} kg</strong>
                <span>{t('landing.previewLogged')}</span>
              </div>
            </div>
            <div className="lp-preview-bar"><div className="lp-preview-bar-fill" /></div>
            <p className="lp-preview-foot">
              <span className={`lp-live-dot${live ? ' lp-live-dot--live' : ''}`} aria-hidden="true" />
              {live ? t('landing.previewSynced') : t('landing.joinMovement')}
            </p>
          </div>

          <div className="lp-float-card lp-float-card--a" aria-hidden="true">
            <span className="material-symbols-outlined">military_tech</span>
            <div>
              <p>{t('landing.previewCommunityLogs')}</p>
              <strong>+{formatCompact(stats?.wasteLogs)}</strong>
            </div>
          </div>
          <div className="lp-float-card lp-float-card--b" aria-hidden="true">
            <span className="material-symbols-outlined">local_fire_department</span>
            <div>
              <p>{t('landing.statBins')}</p>
              <strong>{formatCompact(stats?.binsMapped)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          <span>{t('landing.marquee')}</span>
          <span>{t('landing.marquee')}</span>
        </div>
      </div>
    </section>
  );
}
