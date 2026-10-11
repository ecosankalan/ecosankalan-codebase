import { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/bottomnav.css';

/* Dock items — Scan rides center, larger, like a macOS dock magnifier */
const ITEMS = [
  { label: 'Home',    icon: 'home',         route: '/dashboard' },
  { label: 'Map',     icon: 'map',          route: '/community' },
  { label: 'Scan',    icon: 'photo_camera', route: '/waste', center: true },
  { label: 'Learn',   icon: 'school',       route: '/learn' },
  { label: 'Profile', icon: 'person',       route: '/profile' },
];

/* Gaussian falloff — icons swell near the cursor, settle at the edges */
const magnification = (distance) => 1 + 0.42 * Math.exp(-((distance / 90) ** 2));

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const innerRef = useRef(null);
  const [focus, setFocus] = useState(null); // { x, width } in px, or null
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const onMove = useCallback((e) => {
    if (reduceMotion || !innerRef.current) return;
    const r = innerRef.current.getBoundingClientRect();
    setFocus({ x: e.clientX - r.left, width: r.width });
  }, [reduceMotion]);

  const onLeave = useCallback(() => setFocus(null), []);

  const scaleFor = (index) => {
    if (!focus) return 1;
    const center = ((index + 0.5) / ITEMS.length) * focus.width;
    return magnification(Math.abs(focus.x - center));
  };

  return (
    <nav className="dock" role="navigation" aria-label="Main navigation">
      <div
        className="dock-inner"
        ref={innerRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {ITEMS.map((item, i) => {
          const active = pathname === item.route ||
            (item.route === '/dashboard' && pathname === '/');
          const scale = scaleFor(i);
          if (item.center) {
            return (
              <button
                key={item.label}
                className="dock-scan"
                onClick={() => navigate(item.route)}
                aria-label="Scan or log waste"
                style={focus ? { transform: `scale(${scale})` } : undefined}
              >
                <span className="dock-scan-circle">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {item.icon}
                  </span>
                </span>
                <span className="dock-scan-label">{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={item.label}
              className={`dock-item${active ? ' active' : ''}`}
              onClick={() => navigate(item.route)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              style={focus ? { transform: `scale(${scale}) translateY(${(scale - 1) * -14}px)` } : undefined}
            >
              <span className="dock-icon-wrap">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
              </span>
              <span className="dock-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
