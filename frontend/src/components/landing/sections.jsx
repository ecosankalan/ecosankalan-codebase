/* ─────────────────────────────────────────────────────────────────
   landing/sections.jsx
   All remaining landing page sections as named exports.
   ───────────────────────────────────────────────────────────────── */

const BANANA_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd5ehGzPOa7Uu5Gm2qcBAQQ9IjuK4jXJa2GPg02SuQ0EhtPEnDKbiGLDGzzwck5U2Y5j5r6L9i1aAP6L2M8gdR0t8qodGGCohXg0eCFHEP92iG3IKr5NPqU4dYsM-qsGOKP4lgS9EZOGEMY_EjG102TR_-r128f1YdcN0YxIXM4JFwnriIolcdJMqE1sfmIgE0WdnYrQYL9FBsKRC0FgqoyhuiI3fpxcl91H5aHS9B4xRRBYJFFCUtaqDqfn6be4SijANbHHn9RBjC';
const TESTIMONIAL_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg9yYwrOMhJQ0lmRLoSEECGFMrgmcPKlSIb5sWwRlnsHTolhuoTQcMp6ic3SKYdYS58Weh0I6vk_OXdYE2eiA9PJyON7d_di7goCycU2KTAg504yS8nnLLAuuPdB07d6u6YYjwHWDgR8fSiv7Bgnp0GQ0R8FCU1JMOqV9lL6K66NJAVDPvaSZZWln2rhtL10BiafznL4nK5O389jXE3QtURnPbvcs7lvSe1vmyHtt_aPehWO1XDzYFJ7hdO9B-ieBw2D6Md4JsnzN7';
const QR_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn5cPn32jisCDAC3Fiman-zLCM6zeBrgG-mM1iA5LlT09qRnLhGg9fudcAc5jpWl_jzfS5uII372dwrwcxwsUaHx-rTKTewgBnbAjXU26MOqVXfiCxRAH5dIhkEyHT_2-iRmYDUBl3LWN6JhTioW6OHPZAH4Byg0GFNlHDuJc6jOTyGOA-WUFKWxg7oPk_IRT9AdYf5sj8EWy9POBk_VugUa-zKTRISgrQOTYqk20RlU3vnTijhbHQiIVjWU6Z7wiL6640vDo7rKXl';

/* ── PROBLEM SECTION ───────────────────────────────────────── */
export function ProblemSection() {
  return (
    <section className="lp-problem lp-section-pad" aria-labelledby="problem-heading">
      <div className="lp-container">
        <div className="lp-section-header lp-reveal">
          <h2 id="problem-heading">
            India Generates{' '}
            <span className="lp-accent-error">Millions Of Tonnes</span>
            {' '}Of Waste Every Year
          </h2>
          <p>
            Our current systems are failing. It's time to digitize waste
            management and empower individuals to take action.
          </p>
        </div>

        <div className="lp-problem-grid">
          <div className="lp-stat-block lp-reveal">
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--lp-primary)' }}
              aria-hidden="true"
            >
              analytics
            </span>
            <p className="lp-stat-number">92 Million</p>
            <p className="lp-stat-desc">
              Tonnes of waste produced annually in India's urban centers.
            </p>
          </div>

          <div className="lp-stat-block lp-reveal lp-delay-1">
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--lp-error)' }}
              aria-hidden="true"
            >
              warning
            </span>
            <p className="lp-stat-number">Only 30%</p>
            <p className="lp-stat-desc">
              Of municipal solid waste is properly segregated at the source.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES SECTION ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'center_focus_weak',
    iconClass: 'lp-feature-icon--green',
    title: 'AI Waste Scanner',
    desc: 'Instant identification of waste types using high-precision computer vision to ensure 100% correct segregation.',
  },
  {
    icon: 'history_edu',
    iconClass: 'lp-feature-icon--sec',
    title: 'Smart Waste Logging',
    desc: 'Track every gram of waste you divert from landfills. Build a verifiable digital footprint of your environmental impact.',
  },
  {
    icon: 'school',
    iconClass: 'lp-feature-icon--tert',
    title: 'Learning Hub',
    desc: 'Gamified micro-courses on composting, circular economy, and zero-waste living. Earn certifications as you learn.',
  },
  {
    icon: 'map',
    iconClass: 'lp-feature-icon--primary',
    title: 'Community Map',
    desc: 'Find nearby collection centers, local upcycling workshops, and see the real-time impact map of your city.',
  },
  {
    icon: 'emoji_events',
    iconClass: 'lp-feature-icon--green2',
    title: 'Weekly Challenges',
    desc: 'Compete with neighbours in "Zero Plastic Weeks" and "Compost Quest" to climb the local leaderboard.',
  },
  {
    icon: 'shopping_cart',
    iconClass: 'lp-feature-icon--cont',
    title: 'Eco-Shop',
    desc: 'Redeem your earned Eco Points for sustainable products and vouchers from our ethical brand partners.',
  },
];

const DELAY_CLASSES = ['', 'lp-delay-1', 'lp-delay-2', 'lp-delay-3', 'lp-delay-4', 'lp-delay-5'];

export function FeaturesSection() {
  return (
    <section className="lp-section-pad" id="features" aria-labelledby="features-heading">
      <div className="lp-container">
        <div className="lp-features-header lp-reveal">
          <h2 id="features-heading">
            A Modern Toolkit for a{' '}
            <span className="lp-accent-primary">Cleaner World</span>
          </h2>
          <p>Everything you need to transform your community, right in your pocket.</p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className={`lp-feature-card lp-reveal ${DELAY_CLASSES[i]}`}
              aria-label={f.title}
            >
              <div className={`lp-feature-icon ${f.iconClass}`}>
                <span className="material-symbols-outlined" aria-hidden="true">{f.icon}</span>
              </div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
              <button className="lp-learn-more" aria-label={`Learn more about ${f.title}`}>
                Learn More
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ──────────────────────────────────────────── */
const STEPS = [
  { label: 'Scan Waste',     desc: 'Use AI to identify items.',       active: true  },
  { label: 'Log Waste',      desc: 'Confirm and record log.',         active: true  },
  { label: 'Learn',          desc: 'Complete micro-lessons.',         active: true  },
  { label: 'Join Community', desc: 'Collaborate on tasks.',           active: false },
  { label: 'Redeem',         desc: 'Spend your eco points.',          active: false },
];

export function HowItWorksSection() {
  return (
    <section className="lp-how lp-section-pad" id="process" aria-labelledby="how-heading">
      <div className="lp-container">
        <div className="lp-how-header lp-reveal">
          <h2 id="how-heading">How It Works</h2>
          <p>Five simple steps to a greener lifestyle.</p>
        </div>

        <div className="lp-steps-wrap">
          <div className="lp-steps-line" aria-hidden="true">
            <div className="lp-steps-line-fill" />
          </div>

          <ol className="lp-steps-grid" aria-label="Steps to get started">
            {STEPS.map((s, i) => (
              <li key={s.label} className={`lp-step lp-reveal ${DELAY_CLASSES[i]}`}>
                <div
                  className={`lp-step-bubble ${s.active ? 'lp-step-bubble--active' : 'lp-step-bubble--inactive'}`}
                  aria-label={`Step ${i + 1}`}
                >
                  {i + 1}
                </div>
                <p className="lp-step-title">{s.label}</p>
                <p className="lp-step-desc">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── AI SHOWCASE ───────────────────────────────────────────── */
export function AIShowcaseSection() {
  return (
    <section className="lp-section-pad" aria-labelledby="ai-heading">
      <div className="lp-container">
        <div className="lp-ai-grid">
          {/* Copy */}
          <div className="lp-reveal">
            <div className="lp-ai-badge">
              <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
              Powered By Responsible AI
            </div>
            <h2 id="ai-heading" className="lp-ai-headline">
              Precision Segregation with Neural Vision
            </h2>
            <p className="lp-ai-desc">
              Our proprietary waste-classification AI has been trained on over 2 million
              local waste items, achieving a 98% accuracy rate in identifying regional recyclables.
            </p>
            <ul className="lp-ai-list">
              <li className="lp-ai-list-item">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                <div>
                  <p className="lp-ai-list-title">Material Identification</p>
                  <p className="lp-ai-list-desc">
                    Distinguishes between LDPE, HDPE, and PET plastics instantly.
                  </p>
                </div>
              </li>
              <li className="lp-ai-list-item">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                <div>
                  <p className="lp-ai-list-title">Localized Database</p>
                  <p className="lp-ai-list-desc">
                    Understands Indian FMCG packaging and regional waste streams.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Phone mockup */}
          <div className="lp-phone-outer lp-reveal lp-delay-2" aria-hidden="true">
            <div className="lp-phone-frame">
              <div className="lp-phone-bg">
                <img src={BANANA_IMG} alt="" className="lp-phone-img" loading="lazy" />
              </div>
              <div className="lp-phone-content">
                <div className="lp-scan-card lp-glass">
                  <div className="lp-scan-row">
                    <span className="lp-scan-label">Analyzing...</span>
                    <span className="lp-scan-pct">96%</span>
                  </div>
                  <div className="lp-scan-bar">
                    <div className="lp-scan-bar-fill" role="progressbar" aria-valuenow={96} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                  <p className="lp-scan-title">Banana Peel</p>
                  <p className="lp-scan-type">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">compost</span>
                    Organic Waste
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── DASHBOARD SECTION ─────────────────────────────────────── */
const BAR_HEIGHTS = ['40%', '60%', '50%', '90%', '75%'];

export function DashboardSection() {
  return (
    <section className="lp-dashboard lp-section-pad" aria-labelledby="dashboard-heading">
      <div className="lp-dashboard-deco" aria-hidden="true">
        <div className="lp-dashboard-deco-circle lp-dashboard-deco-circle--1" />
        <div className="lp-dashboard-deco-circle lp-dashboard-deco-circle--2" />
      </div>

      <div className="lp-container">
        <div className="lp-dashboard-header lp-reveal">
          <h2 id="dashboard-heading">Your Sustainability Command Center</h2>
          <p>Visualize your progress and climb the global ranks.</p>
        </div>

        <div className="lp-dashboard-grid">
          {/* Eco Score */}
          <div className="lp-dash-card lp-eco-score lp-reveal">
            <p className="lp-score-label">Eco Score</p>
            <div className="lp-donut-wrap">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  style={{ opacity: 0.1 }}
                />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="#a5f4b6"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset="70"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="lp-donut-center">
                <span className="lp-score-num">842</span>
                <span className="lp-score-sub">Level 5</span>
              </div>
            </div>
            <p className="lp-score-title">Green Warrior</p>
          </div>

          {/* Right stats */}
          <div className="lp-dash-right lp-reveal lp-delay-2">
            {/* CO2 card */}
            <div className="lp-dash-card">
              <p className="lp-co2-label">CO₂ Saved</p>
              <p className="lp-co2-number">
                3,400<span className="lp-co2-unit">kg</span>
              </p>
              <div className="lp-mini-bars" aria-label="CO2 savings trend chart" role="img">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="lp-mini-bar"
                    style={{ height: h }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {/* Achievements card */}
            <div className="lp-dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p className="lp-achievements-label">Unlocked Achievements</p>
                <div className="lp-badge-row" role="list" aria-label="Earned achievement badges">
                  {['🌱', '🌊', '♻️'].map((emoji) => (
                    <div key={emoji} className="lp-badge" role="listitem">{emoji}</div>
                  ))}
                </div>
              </div>
              <button className="lp-ranking-btn">View Global Ranking</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── IMPACT SECTION ────────────────────────────────────────── */
const IMPACT_NUMBERS = [
  { value: '12,000', sup: '+', desc: 'kg Waste Logged' },
  { value: '3,400',  sup: '+', desc: 'kg CO₂ Offset'   },
  { value: '150',    sup: '+', desc: 'Local Centers'    },
  { value: '24k',    sup: '+', desc: 'Trees Planted'    },
];

export function ImpactSection() {
  return (
    <section className="lp-section-pad" id="impact" aria-labelledby="impact-heading">
      <div className="lp-container">
        <div className="lp-impact-grid">
          {/* Numbers */}
          <div className="lp-reveal">
            <h2 id="impact-heading" className="lp-impact-headline">
              Numbers that Tell{' '}
              <span className="lp-accent-primary">Our Story</span>
            </h2>
            <div className="lp-numbers-grid">
              {IMPACT_NUMBERS.map((n) => (
                <div key={n.desc}>
                  <p className="lp-number-block-val">
                    {n.value}<sup>{n.sup}</sup>
                  </p>
                  <p className="lp-number-block-desc">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="lp-testimonial lp-reveal lp-delay-2">
            <div className="lp-stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  star
                </span>
              ))}
            </div>
            <blockquote className="lp-quote">
              "EcoSankalan has completely changed how my family looks at trash.
              My kids now compete to see who can log more recyclables.
              It's truly revolutionary."
            </blockquote>
            <div className="lp-quote-author">
              <img
                src={TESTIMONIAL_AVATAR}
                alt="Rajesh Malhotra"
                className="lp-quote-avatar"
                loading="lazy"
                width={52}
                height={52}
              />
              <div>
                <p className="lp-quote-name">Rajesh Malhotra</p>
                <p className="lp-quote-role">Green Warrior Level 4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── DOWNLOAD BANNER ───────────────────────────────────────── */
export function DownloadSection() {
  return (
    <section className="lp-download" aria-labelledby="download-heading">
      <div className="lp-download-inner">
        <div className="lp-download-tint" aria-hidden="true" />
        <div className="lp-download-content">
          {/* Copy */}
          <div className="lp-reveal">
            <h2 id="download-heading" className="lp-download-headline">
              Start Your Sustainability Journey Today
            </h2>
            <p className="lp-download-sub">
              Download the EcoSankalan app and become part of a movement that matters.
            </p>
            <div className="lp-store-btns">
              <button type="button" className="lp-store-btn" aria-label="Download on the App Store">
                <svg className="lp-store-apple" viewBox="0 0 32 38" aria-hidden="true">
                  <path d="M26.73 20.2c.04-4.05 3.31-6 3.46-6.09a7.44 7.44 0 0 0-5.86-3.17c-2.46-.26-4.84 1.47-6.09 1.47-1.28 0-3.2-1.45-5.29-1.4a7.76 7.76 0 0 0-6.54 3.98c-2.83 4.9-.72 12.1 1.99 16.05 1.36 1.94 2.94 4.1 5.03 4.02 2.04-.08 2.8-1.29 5.26-1.29 2.44 0 3.16 1.29 5.28 1.24 2.2-.03 3.58-1.94 4.89-3.89a16.02 16.02 0 0 0 2.24-4.56 7.02 7.02 0 0 1-4.37-6.36ZM22.72 8.33A7.12 7.12 0 0 0 24.35 3a7.28 7.28 0 0 0-4.72 2.54 6.79 6.79 0 0 0-1.68 5.14 6.02 6.02 0 0 0 4.77-2.35Z" />
                </svg>
                <span className="lp-store-btn-text">
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </span>
              </button>
              <button type="button" className="lp-store-btn" aria-label="Get it on Google Play">
                <svg className="lp-store-google" viewBox="0 0 42 46" aria-hidden="true">
                  <path fill="#00d2ff" d="M2.1 2.6A4.4 4.4 0 0 0 1 5.7v34.6a4.4 4.4 0 0 0 1.1 3.1l.2.2 19.4-19.4v-.5L2.3 2.4l-.2.2Z" />
                  <path fill="#ffca28" d="m28.2 30.7-6.5-6.5v-.5l6.5-6.5.2.1 7.8 4.4c2.2 1.3 2.2 3.3 0 4.6l-7.8 4.4h-.2Z" />
                  <path fill="#f44336" d="m28.4 30.7-6.7-6.7L2.1 43.5c.7.8 1.9.9 3.2.2l23.1-13Z" />
                  <path fill="#4caf50" d="M28.4 17.3 5.3 4.3c-1.3-.7-2.5-.6-3.2.2L21.7 24l6.7-6.7Z" />
                </svg>
                <span className="lp-store-btn-text">
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </span>
              </button>
            </div>
          </div>

          {/* QR */}
          <div className="lp-qr-wrap lp-reveal lp-delay-2">
            <div className="lp-qr-card">
              <img
                src={QR_IMG}
                alt="QR code to download EcoSankalan"
                className="lp-qr-img"
                loading="lazy"
                width={160}
                height={160}
              />
              <p className="lp-qr-label">Scan to Download</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── LANDING FOOTER ────────────────────────────────────────── */
const FOOTER_LINKS = {
  Platform: ['Waste Scanner', 'Impact Hub', 'Leaderboards', 'API Access'],
  Learning: ['Micro-Courses', 'Blog', 'Eco Guides', 'Certifications'],
  Company:  ['About Us', 'Partners', 'Careers', 'Contact'],
  Legal:    ['Privacy', 'Terms', 'Security'],
};

export function LandingFooter() {
  return (
    <footer className="lp-footer" aria-label="Site footer">
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-grid">
          {/* Brand column */}
          <div>
            <div className="lp-footer-brand-name">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                eco
              </span>
              EcoSankalan
            </div>
            <p className="lp-footer-about">
              Revolutionizing waste management through AI and community-driven
              action. Join us in building a sustainable future.
            </p>
            <div className="lp-footer-social">
              {['language', 'forum', 'share'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="lp-social-btn"
                  aria-label={icon}
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col} className="lp-footer-col">
              <h3 className="lp-footer-col-title">{col}</h3>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" onClick={(e) => e.preventDefault()}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">
            © {new Date().getFullYear()} EcoSankalan · NSUT CPVS-STP 2025-26.
            Together, We Build Cleaner Communities.
          </p>
          <p className="lp-footer-made">Made with 💚 in India</p>
        </div>
      </div>
    </footer>
  );
}
