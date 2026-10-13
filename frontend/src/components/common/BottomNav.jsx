import { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/bottomnav.css';

/**
 * EcoTabBar — animated bottom navigation (Leaf Harvest theme).
 * - Floating cream pill with a sliding active indicator.
 * - Icons pop + labels slide in on activation; press ripple on tap.
 * - Center Scan action rides raised with a glow halo.
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const barRef = useRef(null);
  const indicatorRef = useRef(null);

  const TABS = [
    { key: 'home', label: t('nav.home'), icon: 'home', route: '/dashboard' },
    { key: 'map', label: t('nav.map'), icon: 'explore', route: '/community', center: true },
    { key: 'scan', label: t('dashboard.scanWaste'), icon: 'qr_code_scanner', route: '/waste', fab: true },
    { key: 'learn', label: t('nav.learn'), icon: 'school', route: '/learn' },
    { key: 'profile', label: t('nav.profile'), icon: 'person', route: '/profile' },
  ];

  const isActive = (tab) =>
    pathname === tab.route || (tab.route === '/dashboard' && pathname === '/');

  const activeIndex = Math.max(
    0,
    TABS.findIndex(isActive)
  );

  /* Slide the indicator pill under the active tab */
  useEffect(() => {
    const bar = barRef.current;
    const indicator = indicatorRef.current;
    if (!bar || !indicator) return;
    const btns = bar.querySelectorAll('[data-tab]');
    const activeBtn = btns[activeIndex];
    if (!activeBtn) return;
    const barRect = bar.getBoundingClientRect();
    const r = activeBtn.getBoundingClientRect();
    indicator.style.width = `${r.width}px`;
    indicator.style.transform = `translateX(${r.left - barRect.left}px)`;
  }, [activeIndex, pathname]);

  return (
    <nav className="ecotab" role="navigation" aria-label={t('nav.home')}>
      <div className="ecotab-bar" ref={barRef}>
        <span className="ecotab-indicator" ref={indicatorRef} aria-hidden="true" />
        {TABS.map((tab) => {
          const active = isActive(tab);
          if (tab.fab) {
            return (
              <button
                key={tab.key}
                data-tab
                type="button"
                className="ecotab-fab"
                onClick={() => navigate(tab.route)}
                aria-label={tab.label}
              >
                <span className="ecotab-fab-core">
                  <span className="material-symbols-outlined" aria-hidden="true">{tab.icon}</span>
                </span>
                <span className="ecotab-fab-label">{tab.label}</span>
              </button>
            );
          }
          return (
            <button
              key={tab.key}
              data-tab
              type="button"
              className={`ecotab-tab${active ? ' active' : ''}${tab.center ? ' ecotab-tab--wide' : ''}`}
              onClick={() => navigate(tab.route)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="ecotab-icon">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
              </span>
              <span className="ecotab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
