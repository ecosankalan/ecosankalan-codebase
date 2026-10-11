import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/navbar.css';
import BrandLogo from './BrandLogo';
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import { useState } from "react";

const DESKTOP_LINKS = [
  { label: 'Home', route: '/dashboard' },
  { label: 'Impact', route: '/impact' },
  { label: 'Challenges', route: '/weekly-challenges' },
  { label: 'Learn', route: '/learn' },
  { label: 'Shop', route: '/shop' },
];

const initialOf = (name) => (name?.trim()?.charAt(0)?.toUpperCase() || 'E');

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const points = user?.ecoPoints ?? user?.eco_points ?? null;
  const avatarUrl = user?.avatarUrl || user?.avatar || user?.profilePic || null;

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate('/dashboard')} role="link" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')} aria-label="Go to dashboard">
        <BrandLogo size="sm" tagline="Go Green Daily" />
      </div>

      {/* Desktop links */}
      <nav className="navbar-links" aria-label="Primary">
        {DESKTOP_LINKS.map(({ label, route }) => (
          <button
            key={route}
            className={`navbar-link${pathname === route ? ' active' : ''}`}
            onClick={() => navigate(route)}
            aria-current={pathname === route ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="navbar-right">
        {points !== null && (
          <button className="navbar-points" onClick={() => navigate('/vouchers')} aria-label={`${points} eco points — view rewards`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
            {Number(points).toLocaleString('en-IN')}
          </button>
        )}

        <div className="notification-wrapper">
          <button
            className="navbar-icon-btn"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-expanded={showNotifications}
          >
            <span className="material-symbols-outlined">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <button className="navbar-avatar-btn" onClick={() => navigate('/profile')} aria-label="Open profile">
          {avatarUrl
            ? <img src={avatarUrl} alt={user?.name || 'Profile'} />
            : initialOf(user?.name)}
        </button>
      </div>
    </header>
  );
}
