import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const STATS = [
  { value: '2,400+', label: 'Kg Waste Logged' },
  { value: '850+',   label: 'Active Users'    },
  { value: '1,200+', label: 'Eco Points Earned'},
  { value: '18+',    label: 'Partner Brands'  },
];

const FEATURES = [
  {
    icon: 'document_scanner',
    title: 'AI Waste Scanner',
    desc: 'Point your camera at any waste item. Our GPT-4 Vision model instantly identifies it, tells you which bin it goes in, and awards you EcoPoints.',
    color: 'var(--primary)',
    bg: 'var(--primary-fixed)',
  },
  {
    icon: 'trophy',
    title: 'Weekly Challenges',
    desc: 'Join community missions like Zero-Plastic Week. Complete tasks, track your progress, and win real eco-rewards from partner brands.',
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    icon: 'map',
    title: 'Bin Locator Map',
    desc: 'Find the nearest recycling bins in your area using GPS-powered map. Never wonder where to dispose again.',
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    icon: 'shopping_bag',
    title: 'Eco Reward Shop',
    desc: 'Redeem your hard-earned EcoPoints for exclusive vouchers from our sustainability-focused partner brands.',
    color: '#6A1B9A',
    bg: '#F3E5F5',
  },
  {
    icon: 'groups',
    title: 'Community Events',
    desc: 'RSVP to local cleanup drives, awareness events, and plantation campaigns organised by NGOs and your college.',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    icon: 'school',
    title: 'Learn & Quiz',
    desc: 'Take interactive quizzes on waste management, watch upcycling tutorials and level up your eco-knowledge.',
    color: '#00695C',
    bg: '#E0F2F1',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: 'app_registration', title: 'Sign Up Free', desc: 'Create your account in under a minute with your email or Google.' },
  { step: '02', icon: 'document_scanner', title: 'Scan Your Waste', desc: 'Use AI scan or manually log waste categories from your home.' },
  { step: '03', icon: 'savings',          title: 'Earn EcoPoints', desc: 'Every log, quiz, and event gives you points. Watch your score grow.' },
  { step: '04', icon: 'redeem',           title: 'Redeem Rewards', desc: 'Unlock exclusive vouchers and offers from our eco-partner brands.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [counted, setCounted]   = useState(false);

  // Parallax + nav shadow on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
      }
      if (!counted && window.scrollY > 200) setCounted(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [counted]);

  // Intersection observer for scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp-root">

      {/* ── Sticky Nav ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <span className="material-symbols-outlined lp-nav-logo-icon" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>eco</span>
            <span className="lp-nav-logo-text">EcoSankalan</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features"   className="lp-nav-link">Features</a>
            <a href="#how"        className="lp-nav-link">How it works</a>
            <a href="#stats"      className="lp-nav-link">Impact</a>
            <button className="lp-nav-login-btn" onClick={() => navigate('/login')}>Log in</button>
            <button className="lp-nav-cta-btn"   onClick={() => navigate('/register')}>Get Started</button>
          </div>
          {/* Mobile: just show CTA */}
          <button className="lp-nav-mobile-cta" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-glow lp-hero-glow--1" />
        <div className="lp-hero-glow lp-hero-glow--2" />
        <div className="lp-hero-inner">
          <div className="lp-hero-badge lp-reveal">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1rem' }}>verified</span>
            NSUT Delhi · CPVS-STP 2025-26(E)
          </div>
          <h1 className="lp-hero-title lp-reveal">
            Turn Waste Into<br />
            <span className="lp-hero-title--gradient">Eco Rewards</span>
          </h1>
          <p className="lp-hero-subtitle lp-reveal">
            EcoSankalan is a hyperlocal waste-management PWA that uses AI to scan your waste,
            award EcoPoints, and connect you with your community to build a greener future.
          </p>
          <div className="lp-hero-actions lp-reveal">
            <button className="lp-btn-primary" onClick={() => navigate('/register')}>
              <span className="material-symbols-outlined">rocket_launch</span>
              Start for Free
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
              <span className="material-symbols-outlined">login</span>
              Already have an account
            </button>
          </div>
          <div className="lp-hero-phones lp-reveal">
            <div className="lp-phone lp-phone--back">
              <div className="lp-phone-screen lp-phone-screen--back">
                <div className="lp-mock-header" />
                <div className="lp-mock-card lp-mock-card--green" />
                <div className="lp-mock-card" />
                <div className="lp-mock-card" />
              </div>
            </div>
            <div className="lp-phone lp-phone--front">
              <div className="lp-phone-screen">
                <div className="lp-mock-scan-ring">
                  <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                </div>
                <div className="lp-mock-label">AI Identifying…</div>
                <div className="lp-mock-result">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--primary)', fontSize: '1.2rem' }}>check_circle</span>
                  <strong>Plastic Bottle</strong> · +12 pts
                </div>
                <div className="lp-mock-bins">
                  {['#2196F3', '#4CAF50', '#F44336'].map((c, i) => (
                    <div key={i} className="lp-mock-bin" style={{ background: c, opacity: i === 0 ? 1 : 0.3 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats" id="stats">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div className="lp-stat-item lp-reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow lp-reveal">Everything you need</p>
          <h2 className="lp-section-title lp-reveal">Powerful features for a<br />greener daily routine</h2>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className="lp-feature-card lp-reveal" key={i} style={{ animationDelay: `${(i % 3) * 0.1}s` }}>
                <div className="lp-feature-icon-wrap" style={{ background: f.bg }}>
                  <span className="material-symbols-outlined" style={{ color: f.color, fontVariationSettings: "'FILL' 1", fontSize: '1.75rem' }}>{f.icon}</span>
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how" id="how">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow lp-reveal">Simple as 1-2-3-4</p>
          <h2 className="lp-section-title lp-reveal">Get started in minutes</h2>
          <div className="lp-how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div className="lp-how-card lp-reveal" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="lp-how-step-num">{h.step}</div>
                <div className="lp-how-icon-wrap">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '2rem', color: 'var(--primary)' }}>{h.icon}</span>
                </div>
                <h3 className="lp-how-title">{h.title}</h3>
                <p className="lp-how-desc">{h.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="lp-how-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta lp-reveal">
        <div className="lp-cta-glow" />
        <div className="lp-cta-inner">
          <span className="material-symbols-outlined lp-cta-leaf" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <h2 className="lp-cta-title">Ready to make your mark<br />on the planet?</h2>
          <p className="lp-cta-sub">Join hundreds of NSUT students already building a greener Delhi.</p>
          <div className="lp-cta-btns">
            <button className="lp-btn-primary lp-btn-primary--light" onClick={() => navigate('/register')}>
              <span className="material-symbols-outlined">person_add</span>
              Create Free Account
            </button>
            <button className="lp-btn-ghost lp-btn-ghost--light" onClick={() => navigate('/login')}>
              Sign In Instead
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--primary)' }}>eco</span>
            <span>EcoSankalan</span>
          </div>
          <p className="lp-footer-copy">© 2025 EcoSankalan · NSUT Delhi · CPVS-STP 2025-26(E)</p>
          <div className="lp-footer-links">
            <button className="lp-footer-link" onClick={() => navigate('/login')}>Login</button>
            <button className="lp-footer-link" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
