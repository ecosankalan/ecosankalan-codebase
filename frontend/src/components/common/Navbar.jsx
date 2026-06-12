import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/navbar.css';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
        <div className="navbar-logo-icon">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>
        <span className="navbar-brand">EcoSankalan</span>
      </div>

      {/* Right side */}
      <div className="navbar-right">
        <button className="navbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
}
