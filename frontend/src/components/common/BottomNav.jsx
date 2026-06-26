import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/bottomnav.css';

const NAV_ITEMS = [
  { label: 'Home',    icon: 'home',         route: '/dashboard' },
  { label: 'Map',     icon: 'map',          route: '/community' },
  { label: 'Learn',   icon: 'school',       route: '/learn'     },
  { label: 'Shop',    icon: 'shopping_bag', route: '/shop'      },
  { label: 'Profile', icon: 'person',       route: '/profile'   },
];

export default function BottomNav() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      {/* FAB — floating action button for quick AI waste scan */}
      <button
        className="fab"
        onClick={() => navigate('/waste')}
        aria-label="AI Scan Waste"
        style={{
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          boxShadow: '0 4px 12px rgba(0, 81, 39, 0.4)',
          transform: 'translateY(-20px)',
          width: '64px',
          height: '64px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>photo_camera</span>
      </button>

      {/* Bottom nav bar — always visible, full width */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map(({ label, icon, route }) => {
            const active = pathname === route;
            return (
              <button
                key={label}
                className={`bottom-nav-item${active ? ' active' : ''}`}
                onClick={() => navigate(route)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <div className={`bottom-nav-icon-wrap${active ? ' active' : ''}`}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {icon}
                  </span>
                </div>
                <span className="bottom-nav-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
