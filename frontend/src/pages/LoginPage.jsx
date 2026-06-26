import { SignIn, SignUp } from '@clerk/react';
import '../styles/login.css';

const clerkAppearance = {
  variables: {
    colorPrimary: '#005127',
    colorText: '#191c1b',
    colorTextSecondary: '#404940',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#191c1b',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '0.5rem',
    spacingUnit: '1rem',
  },
  elements: {
    card: {
      boxShadow: 'none',
      border: '1px solid rgba(191,201,189,0.35)',
      borderRadius: '0.75rem',
    },
    formButtonPrimary: {
      backgroundColor: '#005127',
      borderRadius: '0.5rem',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      fontSize: '0.95rem',
      padding: '0.875rem 1.5rem',
      textTransform: 'none',
      boxShadow: '0 4px 16px rgba(0,81,39,0.15)',
      '&:hover': {
        backgroundColor: '#1b6b3a',
        boxShadow: '0 6px 20px rgba(0,81,39,0.25)',
      },
    },
    socialButtonsBlockButton: {
      borderRadius: '0.5rem',
      border: '1px solid rgba(191,201,189,0.35)',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      backgroundColor: '#f2f4f2',
      '&:hover': {
        backgroundColor: '#e6e9e7',
      },
    },
    formFieldInput: {
      borderRadius: '0.5rem',
      border: '1px solid rgba(191,201,189,0.35)',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.95rem',
      padding: '0.875rem 1rem',
      '&:focus': {
        borderColor: 'rgba(0,81,39,0.4)',
        boxShadow: '0 0 0 3px rgba(0,81,39,0.08)',
      },
    },
    formFieldLabel: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      fontSize: '0.875rem',
      color: '#404940',
    },
    footerActionLink: {
      color: '#005127',
      fontWeight: 600,
      '&:hover': {
        color: '#1b6b3a',
      },
    },
    headerTitle: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      color: '#191c1b',
    },
    headerSubtitle: {
      fontFamily: "'Inter', sans-serif",
      color: '#404940',
    },
    dividerLine: {
      backgroundColor: 'rgba(191,201,189,0.35)',
    },
    dividerText: {
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#707a6f',
    },
  },
};

export default function LoginPage({ mode = 'signIn' }) {
  const isSignUp = mode === 'signUp';

  const heading = isSignUp
    ? { title: 'Join EcoSankalan', subtitle: 'Create an account and start your sustainability journey.' }
    : { title: 'Welcome Back', subtitle: 'Please enter your details to continue your impact journey.' };

  return (
    <div className="login-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="login-card">

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

        <section className="form-panel">
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
            <h3>{heading.title}</h3>
            <p>{heading.subtitle}</p>
          </div>

          <div className="clerk-wrapper">
            {isSignUp ? (
              <SignUp
                appearance={clerkAppearance}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            ) : (
              <SignIn
                appearance={clerkAppearance}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
