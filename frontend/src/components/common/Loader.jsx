import React from 'react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';
import '../../styles/loader.css';

/**
 * EcoSankalan "Sprout" loader — Leaf Harvest theme.
 * - Inline variant: compact, for cards/sections.
 * - Fullscreen variant: blurred cream overlay for route/auth transitions.
 */
export function FullscreenLoader({ text }) {
  const { t } = useTranslation();
  return (
    <div className="eco-loader-full" role="status" aria-live="polite" aria-label={text || t('loader.default')}>
      <div className="eco-loader-ambient" aria-hidden="true">
        <span className="eco-loader-blob eco-loader-blob--a" />
        <span className="eco-loader-blob eco-loader-blob--b" />
        <span className="eco-loader-blob eco-loader-blob--c" />
      </div>
      <div className="eco-loader-card" aria-hidden="true">
        <BrandLogo size="sm" iconOnly />
        <div className="eco-loader-sprout">
          <svg viewBox="0 0 96 96" className="eco-loader-pot">
            <ellipse cx="48" cy="82" rx="26" ry="7" className="eco-loader-shadow" />
            <path d="M30 62 h36 l-4 20 a4 4 0 0 1 -4 3 h-20 a4 4 0 0 1 -4 -3 z" className="eco-loader-pot-body" />
            <path d="M28 62 h40 a3 3 0 0 0 3 -3 v-2 h-46 v2 a3 3 0 0 0 3 3 z" className="eco-loader-pot-rim" />
          </svg>
          <svg viewBox="0 0 96 96" className="eco-loader-plant">
            <path d="M48 62 C48 46 48 34 48 22" className="eco-loader-stem" />
            <g className="eco-loader-leaf eco-loader-leaf--left">
              <path d="M48 46 C36 46 28 38 26 26 C38 28 46 34 48 46 Z" />
              <path d="M29 29 L45 43" className="eco-loader-vein" />
            </g>
            <g className="eco-loader-leaf eco-loader-leaf--right">
              <path d="M48 38 C60 38 68 30 70 18 C58 20 50 26 48 38 Z" />
              <path d="M67 21 L51 35" className="eco-loader-vein" />
            </g>
            <g className="eco-loader-leaf eco-loader-leaf--top">
              <path d="M48 24 C42 16 42 8 48 2 C54 8 54 16 48 24 Z" />
            </g>
          </svg>
          <span className="eco-loader-ring" />
          <span className="eco-loader-spark eco-loader-spark--1" />
          <span className="eco-loader-spark eco-loader-spark--2" />
          <span className="eco-loader-spark eco-loader-spark--3" />
        </div>
        <p className="eco-loader-text">{text || t('loader.default')}</p>
        <div className="eco-loader-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

export default function Loader({ text, fullscreen = false }) {
  const { t } = useTranslation();
  if (fullscreen) return <FullscreenLoader text={text} />;
  return (
    <div className="eco-loader-inline" role="status" aria-live="polite">
      <span className="eco-loader-mini" aria-hidden="true">
        <img src="/logo.png" alt="" className="eco-loader-mini-logo" />
      </span>
      <p className="eco-loader-text">{text || t('loader.default')}</p>
    </div>
  );
}
