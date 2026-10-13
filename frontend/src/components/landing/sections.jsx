import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePlatformStats, { formatCompact } from '../../hooks/usePlatformStats';
import BrandLogo from '../common/BrandLogo';

/* ── Problem ─────────────────────────────────────────── */
export function ProblemSection() {
  const { t } = useTranslation();
  const cards = [
    { icon: 'delete', title: t('landing.problemC1T'), desc: t('landing.problemC1D') },
    { icon: 'recycling', title: t('landing.problemC2T'), desc: t('landing.problemC2D') },
    { icon: 'help', title: t('landing.problemC3T'), desc: t('landing.problemC3D') },
  ];
  return (
    <section className="lp-section" aria-labelledby="problem-title">
      <div className="lp-container">
        <p className="lp-eyebrow lp-reveal">{t('landing.problemEyebrow')}</p>
        <h2 id="problem-title" className="lp-h2 lp-reveal">{t('landing.problemTitle')}</h2>
        <p className="lp-sub lp-reveal">{t('landing.problemSub')}</p>
        <div className="lp-cards-3">
          {cards.map((c, i) => (
            <article key={c.title} className={`lp-card lp-reveal lp-delay-${i + 1}`}>
              <span className="lp-card-icon material-symbols-outlined" aria-hidden="true">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features bento ──────────────────────────────────── */
export function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    { icon: 'photo_spark', title: t('landing.f1T'), desc: t('landing.f1D'), span: 'wide' },
    { icon: 'map', title: t('landing.f2T'), desc: t('landing.f2D'), span: '' },
    { icon: 'savings', title: t('landing.f3T'), desc: t('landing.f3D'), span: '' },
    { icon: 'emoji_events', title: t('landing.f4T'), desc: t('landing.f4D'), span: '' },
    { icon: 'quiz', title: t('landing.f5T'), desc: t('landing.f5D'), span: '' },
    { icon: 'monitoring', title: t('landing.f6T'), desc: t('landing.f6D'), span: 'wide' },
  ];
  return (
    <section className="lp-section lp-section--sand" id="features" aria-labelledby="features-title">
      <div className="lp-container">
        <p className="lp-eyebrow lp-reveal">{t('landing.featuresEyebrow')}</p>
        <h2 id="features-title" className="lp-h2 lp-reveal">{t('landing.featuresTitle')}</h2>
        <p className="lp-sub lp-reveal">{t('landing.featuresSub')}</p>
        <div className="lp-bento">
          {features.map((f, i) => (
            <article key={f.title} className={`lp-bento-card lp-bento-card--${f.span || 'std'} lp-reveal lp-delay-${(i % 3) + 1}`}>
              <span className="lp-bento-icon material-symbols-outlined" aria-hidden="true">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="lp-bento-num" aria-hidden="true">0{i + 1}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────── */
export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = [
    { icon: 'person_add', title: t('landing.h1T'), desc: t('landing.h1D') },
    { icon: 'qr_code_scanner', title: t('landing.h2T'), desc: t('landing.h2D') },
    { icon: 'location_on', title: t('landing.h3T'), desc: t('landing.h3D') },
    { icon: 'add_task', title: t('landing.h4T'), desc: t('landing.h4D') },
    { icon: 'local_fire_department', title: t('landing.h5T'), desc: t('landing.h5D') },
  ];
  return (
    <section className="lp-section" id="process" aria-labelledby="how-title">
      <div className="lp-container">
        <p className="lp-eyebrow lp-reveal">{t('landing.howEyebrow')}</p>
        <h2 id="how-title" className="lp-h2 lp-reveal">{t('landing.howTitle')}</h2>
        <p className="lp-sub lp-reveal">{t('landing.howSub')}</p>
        <ol className="lp-steps">
          {steps.map((s, i) => (
            <li key={s.title} className="lp-step lp-reveal">
              <span className="lp-step-num" aria-hidden="true">{i + 1}</span>
              <span className="lp-step-icon material-symbols-outlined" aria-hidden="true">{s.icon}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── AI showcase ─────────────────────────────────────── */
export function AIShowcaseSection() {
  const { t } = useTranslation();
  const { stats } = usePlatformStats();
  const points = [t('landing.aiP1'), t('landing.aiP2'), t('landing.aiP3')];
  return (
    <section className="lp-section lp-section--dark" aria-labelledby="ai-title">
      <div className="lp-container lp-split">
        <div className="lp-reveal">
          <p className="lp-eyebrow lp-eyebrow--light">{t('landing.aiEyebrow')}</p>
          <h2 id="ai-title" className="lp-h2 lp-h2--light">{t('landing.aiTitle')}</h2>
          <p className="lp-sub lp-sub--light">{t('landing.aiSub')}</p>
          <ul className="lp-checks">
            {points.map((p) => (
              <li key={p}><span className="material-symbols-outlined" aria-hidden="true">check_circle</span>{p}</li>
            ))}
          </ul>
        </div>
        <div className="lp-phone lp-reveal lp-delay-2" aria-hidden="true">
          <div className="lp-phone-notch" />
          <div className="lp-phone-screen">
            <span className="lp-phone-scan material-symbols-outlined">qr_code_scanner</span>
            <div className="lp-phone-frame" />
            <p className="lp-phone-label">{t('landing.aiEyebrow')}</p>
            <div className="lp-phone-bin">{formatCompact(stats?.binsMapped)} {t('landing.statBins')} · {formatCompact(stats?.wasteLogs)} {t('landing.impactLogs')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── App preview (kept for LandingPage import compat) ── */
export function DashboardSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, live } = usePlatformStats();
  return (
    <section className="lp-section lp-section--sand" aria-labelledby="app-title">
      <div className="lp-container lp-split">
        <div className="lp-reveal">
          <p className="lp-eyebrow">{t('landing.featuresEyebrow')}</p>
          <h2 id="app-title" className="lp-h2">{t('landing.featuresTitle')}</h2>
          <p className="lp-sub">{t('landing.featuresSub')}</p>
          <button className="lp-btn lp-btn--primary lp-magnet" onClick={() => navigate('/register')}>
            {t('landing.ctaStart')}
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
        <div className="lp-mini-dash lp-reveal lp-delay-2" aria-hidden="true">
          <div className="lp-mini-row"><span /><span className="w60" /><div className="lp-mini-val"><strong>{formatCompact(stats?.totalPoints)}</strong><small>{t('landing.previewPoints')}</small></div></div>
          <div className="lp-mini-row"><span /><span className="w40" /><div className="lp-mini-val"><strong>{formatCompact(stats?.wasteKg)}kg</strong><small>{t('landing.previewLogged')}</small></div></div>
          <div className="lp-mini-row"><span /><span className="w75" /><div className="lp-mini-val"><strong>{formatCompact(stats?.wasteLogs)}</strong><small>{t('landing.impactLogs')}</small></div></div>
          <div className="lp-mini-bar"><i /></div>
        </div>
      </div>
    </section>
  );
}

/* ── Impact ──────────────────────────────────────────── */
export function ImpactSection() {
  const { t } = useTranslation();
  const { stats } = usePlatformStats();
  return (
    <section className="lp-section" id="impact" aria-labelledby="impact-title">
      <div className="lp-container">
        <p className="lp-eyebrow lp-reveal">{t('landing.impactEyebrow')}</p>
        <h2 id="impact-title" className="lp-h2 lp-reveal">{t('landing.impactTitle')}</h2>
        <p className="lp-sub lp-reveal">{t('landing.impactSub')}</p>
        <div className="lp-impact-grid">
          <div className="lp-impact-num lp-reveal">
            <strong>{formatCompact(stats?.binsMapped)}</strong>
            <span>{t('landing.statBins')}</span>
          </div>
          <div className="lp-impact-num lp-reveal lp-delay-1">
            <strong>{formatCompact(stats?.wasteKg)}kg</strong>
            <span>{t('landing.statWaste')}</span>
          </div>
          <div className="lp-impact-num lp-reveal lp-delay-2">
            <strong>{formatCompact(stats?.ecoWarriors)}</strong>
            <span>{t('landing.impactWarriors')}</span>
          </div>
          <div className="lp-impact-num lp-reveal lp-delay-3">
            <strong>{formatCompact(stats?.wasteLogs)}</strong>
            <span>{t('landing.impactLogs')}</span>
          </div>
        </div>
        <figure className="lp-quote lp-reveal">
          <blockquote>“{t('landing.impactTestimonial')}”</blockquote>
          <figcaption>— {t('landing.impactAuthor')}</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────────── */
export function DownloadSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="lp-section" aria-labelledby="cta-title">
      <div className="lp-container">
        <div className="lp-cta lp-reveal">
          <span className="lp-cta-leaf" aria-hidden="true"><img src="/logo.png" alt="" /></span>
          <h2 id="cta-title">{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaSub')}</p>
          <button className="lp-btn lp-btn--light lp-magnet" onClick={() => navigate('/register')}>
            {t('landing.ctaBtn')}
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
          <small>{t('landing.ctaNote')}</small>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────── */
export function LandingFooter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-grid">
        <div>
          <BrandLogo size="sm" />
          <p>{t('landing.footerTag')}</p>
        </div>
        <nav aria-label="Footer">
          <strong>{t('landing.footerProduct')}</strong>
          <button onClick={() => navigate('/register')}>{t('landing.getStarted')}</button>
          <button onClick={() => navigate('/login')}>{t('landing.login')}</button>
        </nav>
        <nav aria-label="Company">
          <strong>{t('landing.footerCompany')}</strong>
          <button onClick={() => navigate('/privacy')}>{t('landing.footerPrivacy')}</button>
        </nav>
      </div>
      <p className="lp-rights">{t('landing.footerRights')}</p>
    </footer>
  );
}
