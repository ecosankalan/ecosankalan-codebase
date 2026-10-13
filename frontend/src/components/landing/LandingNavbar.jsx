import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../common/BrandLogo';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`} aria-label="Main navigation">
      <div className="lp-nav-inner">
        {/* Logo */}
        <div
          className="lp-nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          role="button"
          tabIndex={0}
          aria-label="EcoSankalan — scroll to top"
          onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BrandLogo size="sm" />
        </div>

        {/* Nav links */}
        <ul className="lp-nav-links" role="list">
          <li><a href="#" className="lp-active-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('landing.navHome')}</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>{t('landing.navFeatures')}</a></li>
          <li><a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('process'); }}>{t('landing.navHow')}</a></li>
          <li><a href="#impact" onClick={(e) => { e.preventDefault(); scrollTo('impact'); }}>{t('landing.navImpact')}</a></li>
        </ul>

        {/* Actions */}
        <div className="lp-nav-actions">
          <LanguageSwitcher compact />
          <button
            className="lp-btn-ghost"
            onClick={() => scrollTo('process')}
            aria-label={t('landing.watchDemo')}
          >
            {t('landing.watchDemo')}
          </button>
          <button
            className="lp-btn-primary"
            onClick={() => navigate('/register')}
            aria-label={t('landing.getStarted')}
          >
            {t('landing.getStarted')}
          </button>
        </div>
      </div>
    </nav>
  );
}