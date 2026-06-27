import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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
          <span
            className="material-symbols-outlined lp-nav-logo-icon"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <span className="lp-nav-brand">EcoSankalan</span>
        </div>

        {/* Nav links */}
        <ul className="lp-nav-links" role="list">
          <li><a href="#" className="lp-active-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
          <li><a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('process'); }}>How It Works</a></li>
          <li><a href="#impact" onClick={(e) => { e.preventDefault(); scrollTo('impact'); }}>Impact</a></li>
        </ul>

        {/* Actions */}
        <div className="lp-nav-actions">
          <button
            className="lp-btn-ghost"
            onClick={() => scrollTo('process')}
            aria-label="Watch demo"
          >
            Watch Demo
          </button>
          <button
            className="lp-btn-primary"
            onClick={() => navigate('/register')}
            aria-label="Get started with EcoSankalan"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}