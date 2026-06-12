import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../styles/login.css';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-root">
      {/* Decorative background blobs */}
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="login-card">

        {/* ── LEFT: Brand panel ─────────────────────────────── */}
        <section className="brand-panel">
          <div className="brand-logo">
            <span
              className="material-symbols-outlined brand-eco-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span className="brand-name">EcoSankalan</span>
          </div>

          <div className="brand-headline">
            <h2>The Living Archive<br />of Impact.</h2>
            <p>
              Join the community of 25,000+ Eco Warriors documenting
              their journey towards a circular future.
            </p>
          </div>

          <div className="brand-stats">
            <div className="stat-box stat-box--dark">
              <span className="stat-number">1.2k</span>
              <span className="stat-label">Tons CO₂ Saved</span>
            </div>
            <div className="stat-box stat-box--chart">
              <div className="mini-chart">
                <div className="bar" style={{ height: '40%' }} />
                <div className="bar" style={{ height: '70%' }} />
                <div className="bar" style={{ height: '55%' }} />
                <div className="bar bar--full" style={{ height: '90%' }} />
              </div>
            </div>
          </div>

          <img
            className="brand-bg-img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA084cuLZj6PfHBbe_UHPbjY3TeWns8yHFjbfGJ2d3odjXhOFv3Qx5zR2ZHKvdZoupS9f7XcKMXa7O34fxkajlwSFzGG9FqroLQQUPfamU-ee22RayqagqF65en2qIjgDoi51FGqm3enLT7brK9IeHKFNucK_zN3yAnYZb70ze5n5fzPmjS9Z4QpQ9E5J9ul0yvu_0VkiVylSQtCNrfD08GW-AFH4IQIrQbL0i0I40ljxx8EKVcbvLCRhg6Nokj3BZaCg2a0_eUgGvh"
            alt="Green leaves"
          />
        </section>

        {/* ── RIGHT: Auth form ──────────────────────────────── */}
        <section className="form-panel">

          {/* Mobile logo (hidden on desktop) */}
          <div className="mobile-logo">
            <span
              className="material-symbols-outlined mobile-eco-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span className="mobile-brand-name">EcoSankalan</span>
          </div>

          <div className="form-heading">
            <h3>Welcome Back</h3>
            <p>Please enter your details to continue your impact journey.</p>
          </div>

          {/* LoginForm handles all form logic + API call */}
          <LoginForm />

          {/* Footer — "Create an account" is static (Month 1) */}
          <footer className="form-footer">
            <p>
              Don't have an account?{' '}
              <span className="create-account-link">
                Create an account
              </span>
            </p>
          </footer>

        </section>
      </main>
    </div>
  );
}
