import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';
import BrandLogo from '../components/common/BrandLogo';
import '../styles/login.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="login-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="login-card">

        {/* ── LEFT: Brand panel ─────────────────────────────── */}
        <section className="brand-panel">
          <div className="brand-logo">
            <BrandLogo size="md" onDark tagline={t('auth.tagline')} />
          </div>
          <div className="brand-headline">
            <h2>{t('auth.registerHeadlineA')}<br />{t('auth.registerHeadlineB')}</h2>
            <p>
              {t('auth.registerHeadlineSub')}
            </p>
          </div>
          <div className="brand-stats">
            <div className="stat-box stat-box--dark">
              <span className="stat-number">21</span>
              <span className="stat-label">{t('auth.featuresBuilt')}</span>
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
            alt={t('auth.brandImgAlt')}
          />
        </section>

        {/* ── RIGHT: Register form ───────────────────────────── */}
        <section className="form-panel">
          <div className="mobile-logo">
            <BrandLogo size="sm" tagline={t('auth.tagline')} />
          </div>

          <div className="form-heading">
            <h3>{t('auth.createAccount')}</h3>
            <p>{t('auth.createAccountSub')}</p>
          </div>

          <RegisterForm />

          <footer className="form-footer">
            <p>
              {t('auth.alreadyHave')}{' '}
              <Link to="/login" className="create-account-link">
                {t('auth.signIn')}
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
