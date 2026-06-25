import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Pages ────────────────────────────────────────────────────────────
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import OTPPage             from './pages/OTPPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import VerifyPhonePage     from './pages/VerifyPhonePage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import DashboardPage       from './pages/DashboardPage';
import WasteLogPage        from './pages/WasteLogPage';
import ImpactPage          from './pages/ImpactPage';
import ShopPage            from './pages/ShopPage';
import CommunityPage       from './pages/CommunityPage';
import ProfilePage         from './pages/ProfilePage';
import LearnPage           from './pages/LearnPage';
import QuizPage            from './pages/QuizPage';
import QuizResultPage      from './pages/QuizResultPage';
import ScanResultPage      from './pages/ScanResultPage';
import WasteHistoryPage    from './pages/WasteHistoryPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import ChallengeProgressPage  from './pages/ChallengeProgressPage';
import EventDetailPage        from './pages/EventDetailPage';
import WeeklyChallengesPage   from './pages/WeeklyChallengesPage';
import ProductDetailPage      from './pages/ProductDetailPage';
import VouchersPage           from './pages/VouchersPage';

import './styles/global.css';

// ── Protected route: redirects to /login if not authenticated ────────
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route path="/login"           element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register"        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/otp"             element={<OTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-phone"    element={<VerifyPhonePage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/waste"     element={<ProtectedRoute><WasteLogPage  /></ProtectedRoute>} />
      <Route path="/impact"    element={<ProtectedRoute><ImpactPage    /></ProtectedRoute>} />
      <Route path="/shop"      element={<ProtectedRoute><ShopPage      /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
      <Route path="/learn"        element={<ProtectedRoute><LearnPage        /></ProtectedRoute>} />
      <Route path="/quiz"         element={<ProtectedRoute><QuizPage         /></ProtectedRoute>} />
      <Route path="/quiz-result"  element={<ProtectedRoute><QuizResultPage   /></ProtectedRoute>} />
      <Route path="/scan-result"        element={<ProtectedRoute><ScanResultPage          /></ProtectedRoute>} />
      <Route path="/waste-history"       element={<ProtectedRoute><WasteHistoryPage         /></ProtectedRoute>} />
      <Route path="/challenge-progress"  element={<ProtectedRoute><ChallengeProgressPage    /></ProtectedRoute>} />
      <Route path="/event-detail"        element={<ProtectedRoute><EventDetailPage          /></ProtectedRoute>} />
      <Route path="/weekly-challenges"   element={<ProtectedRoute><WeeklyChallengesPage     /></ProtectedRoute>} />
      <Route path="/product-detail"      element={<ProtectedRoute><ProductDetailPage   /></ProtectedRoute>} />
      <Route path="/vouchers"            element={<ProtectedRoute><VouchersPage         /></ProtectedRoute>} />
      <Route path="/analytics"           element={<Navigate to="/impact" replace />} />

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
