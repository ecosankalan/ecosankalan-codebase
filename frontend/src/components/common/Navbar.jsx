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
        <img src="/logo.png" alt="EcoSankalan Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
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
