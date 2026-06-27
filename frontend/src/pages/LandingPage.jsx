/**
 * LandingPage.jsx
 *
 * Public marketing landing page for EcoSankalan.
 * Route: / (public, before auth)
 *
 * Architecture:
 *  - Orchestrates all landing sections
 *  - Owns scroll-reveal IntersectionObserver
 *  - Owns leaf particle generator
 *  - Imports landing.css (scoped via .lp-root namespace)
 *  - Does NOT import global Navbar/BottomNav (has its own LandingNavbar)
 */

import { useEffect, useRef } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection   from '../components/landing/HeroSection';
import {
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  AIShowcaseSection,
  DashboardSection,
  ImpactSection,
  DownloadSection,
  LandingFooter,
} from '../components/landing/sections';
import '../styles/landing.css';

/* Leaf particle emitter ─────────────────────────────────────── */
function useLeafParticles(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Respect reduced-motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const createLeaf = () => {
      const leaf = document.createElement('span');
      leaf.className = 'material-symbols-outlined lp-leaf-particle';
      leaf.textContent = 'eco';
      leaf.setAttribute('aria-hidden', 'true');
      leaf.style.left = `${Math.random() * 98}vw`;
      leaf.style.fontSize = `${Math.random() * 16 + 10}px`;
      leaf.style.animationDuration = `${Math.random() * 8 + 14}s`;
      leaf.style.bottom = '0';
      document.body.appendChild(leaf);
      setTimeout(() => leaf.remove(), 22000);
    };

    const interval = setInterval(createLeaf, 3500);
    return () => {
      clearInterval(interval);
      // Clean up any stray particles
      document.querySelectorAll('.lp-leaf-particle').forEach((el) => el.remove());
    };
  }, [rootRef]);
}

/* Scroll reveal observer ────────────────────────────────────── */
function useScrollReveal(rootRef) {
  useEffect(() => {
    const elements = rootRef.current?.querySelectorAll('.lp-reveal') ?? [];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-active');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

/* Page component ────────────────────────────────────────────── */
export default function LandingPage() {
  const rootRef = useRef(null);

  useLeafParticles(rootRef);
  useScrollReveal(rootRef);

  return (
    <div className="lp-root" ref={rootRef}>
      {/* Skip-to-content for keyboard users */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          zIndex: 999,
          background: 'var(--lp-primary)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '0 0 8px 0',
        }}
        onFocus={(e) => { e.target.style.left = '0'; }}
        onBlur={(e)  => { e.target.style.left = '-9999px'; }}
      >
        Skip to main content
      </a>

      <LandingNavbar />

      <main id="main-content">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AIShowcaseSection />
        <DashboardSection />
        <ImpactSection />
        <DownloadSection />
      </main>

      <LandingFooter />
    </div>
  );
}