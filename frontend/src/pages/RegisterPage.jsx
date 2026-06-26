import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/login.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="login-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="login-card">

        {/* ── LEFT: Brand panel ─────────────────────────────── */}
        <section className="brand-panel">
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="EcoSankalan Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span className="brand-name">EcoSankalan</span>
          </div>
          <div className="brand-headline">
            <h2>Start Your<br />Green Journey.</h2>
            <p>
              Join 25,000+ Eco Warriors and make a measurable impact
              on your community every single day.
            </p>
          </div>
          <div className="brand-stats">
            <div className="stat-box stat-box--dark">
              <span className="stat-number">21</span>
              <span className="stat-label">Features Built</span>
            </div>
            <div className="stat-box stat-box--chart">
              <div className="mini-chart">
                <div className="bar" style={{ height: '30%' }} />
                <div className="bar" style={{ height: '60%' }} />
                <div className="bar" style={{ height: '80%' }} />
                <div className="bar bar--full" style={{ height: '100%' }} />
              </div>
            </div>
          </div>
          <img
            className="brand-bg-img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA084cuLZj6PfHBbe_UHPbjY3TeWns8yHFjbfGJ2d3odjXhOFv3Qx5zR2ZHKvdZoupS9f7XcKMXa7O34fxkajlwSFzGG9FqroLQQUPfamU-ee22RayqagqF65en2qIjgDoi51FGqm3enLT7brK9IeHKFNucK_zN3yAnYZb70ze5n5fzPmjS9Z4QpQ9E5J9ul0yvu_0VkiVylSQtCNrfD08GW-AFH4IQIrQbL0i0I40ljxx8EKVcbvLCRhg6Nokj3BZaCg2a0_eUgGvh"
            alt="Green leaves"
          />
        </section>

        {/* ── RIGHT: Register form ───────────────────────────── */}
        <section className="form-panel">
          <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="EcoSankalan Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span className="brand-name" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>EcoSankalan</span>
          </div>

          <div className="form-heading">
            <h3>Create Account</h3>
            <p>Join the community and start your impact journey today.</p>
          </div>

          <RegisterForm />

          <footer className="form-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="create-account-link">
                Sign in
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
