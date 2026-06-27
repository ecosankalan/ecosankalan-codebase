import { useNavigate } from 'react-router-dom';

const AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBJf7igs8EyImUIN7kCfcX_cKuRw66Hfr14B5RnEUhz1EBmEdJ3RfSMU_U3GYeHKszubQ6B-cD1kvPM6q6ZyQHvvR1SQqkwY7MZ7RcezlcFmICBSVqat03szwj7yON6RsyU1k6LSr2uNZw_YXPXM1s2M8ynoetiRrqW_HQirZG8R-wOOQ1ZHW5dXDLpZPUIugqlstvtZYbNHSLgqEWWOXuF27CijG_ZpXl1BLU9dtjKuwmDrnBxPTj7ZSUDrLg1qG3U4oIskMWXcIv9',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAcYHlEdzHGX8bdjFVl5IszIwIbwDBf5iMpfanpWLXXTcB54krexFaG-wuSYF0bwAMW_42PRREvp8aOAgLfCIlhBseQYir4NVc7g5YIZVMwnpuR2Eoff_Xkemkl_bQIOYK6eSHCxir4kzDSQM5WahRbOdGUf9NT4LhwXUNWASpx7TJ_i6qAK4EYfNLnbNvq-hleDdKytsFMTTjLBQzOsiDfcKLWS-yLnLtFMZj5ynyWca3UdU3ePGNygLWMm5fZRPnmuyX8u702E1wG',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbM7yI7DzNeBNdUa4tAdfafaGKwzpQIhu893utcVZYzEMld11uqotGMWXC-JPfwCp5nggJZ-G-KdYjrmdEorbCqczdzbP6QOGHzYZwyznHybgaxEHaYBfs5-7F1OgFVwxJ64Rp8A_NGpX1jq9SwWyXQ9tyXOhGiGykAc0dDnvNzqOmZe7CEnUmbf99RDffvyuuQkgq5SgFY4RHQqHeHC_E7_bz3qUMVwiaD-05LREejYhk8corXRk_chPrXEpBTgruIesji8DiL-mf',
];

const HERO_MOCKUP = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYTWKu7dSkvuFTP13hVygQ_zqMdsXZOx4oaU9TD5O62iD1XyA_kJhU6Jievcvq-zApQkqHwcX0hhTCEzueA1vPHn08CjR8_jyDLkJTD8lzkpBiXUyqhdLb3odPw1WnJBBQEJkeHfr7xPR0SvdQVWUmMktHbJcNiN433fSjZ23W3K5qveFh1ZLe7jQ72hl97eyKGfpUOEqZokhPgm6j35du8k9TpL0rbSafxWW-PO-tpZ5Bs30TAZCbOXvYxrga5ErSAZlL9EnBkXSj';

export default function HeroSection() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="lp-hero" aria-labelledby="hero-headline">
      <div className="lp-hero-bg" aria-hidden="true">
        <div className="lp-hero-blob lp-hero-blob--1" />
        <div className="lp-hero-blob lp-hero-blob--2" />
      </div>

      <div className="lp-container">
        <div className="lp-hero-grid">
          <div className="lp-reveal">
            <h1 id="hero-headline" className="lp-hero-headline">
              Build Sustainable Habits, One <em>Waste Log</em> At A Time.
            </h1>
            <p className="lp-hero-sub">
              AI-powered waste management, eco-learning, community challenges,
              rewards, and real-world environmental impact — all in one platform.
            </p>

            <div className="lp-hero-ctas">
              <button
                className="lp-btn-hero-primary"
                onClick={() => navigate('/register')}
                aria-label="Start your eco journey — create an account"
              >
                Start Your Eco Journey
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
              <button
                className="lp-btn-hero-secondary"
                onClick={() => scrollTo('process')}
                aria-label="Watch demo — learn how it works"
              >
                Watch Demo
              </button>
            </div>

            <div className="lp-hero-social">
              <div className="lp-avatars" role="img" aria-label="Profile photos of community members">
                {AVATARS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="lp-avatar"
                    loading="lazy"
                    width={48}
                    height={48}
                  />
                ))}
              </div>
              <p className="lp-social-text">
                Joined by <strong>12,000+</strong>
                <br />eco-warriors this month
              </p>
            </div>
          </div>

          <div className="lp-hero-visual lp-reveal lp-delay-2">
            <div className="lp-hero-mockup-wrap">
              <img
                src={HERO_MOCKUP}
                alt="EcoSankalan app dashboard showing sustainability metrics"
                className="lp-hero-mockup"
                loading="eager"
                width={480}
                height={600}
              />
            </div>

            <div className="lp-float-card lp-glass lp-float-card--points" aria-hidden="true">
              <div className="lp-float-icon-box">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
              </div>
              <div>
                <p className="lp-float-label">Daily Points</p>
                <p className="lp-float-value">+1,240</p>
              </div>
            </div>

            <div className="lp-float-card lp-glass lp-float-card--streak" aria-hidden="true">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: '#ba1a1a' }}
              >
                local_fire_department
              </span>
              <div>
                <p className="lp-float-label">Current Streak</p>
                <p className="lp-float-value lp-float-value--dark">14 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
