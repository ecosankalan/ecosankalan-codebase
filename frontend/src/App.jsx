import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';

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

import './styles/global.css';

// ── Protected route: redirects to /sign-in if not authenticated ───────
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="login-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
};

function AppRoutes() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="login-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Clerk auth routes — redirect if already signed in */}
      <Route path="/sign-in/*" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage mode="signIn" />} />
      <Route path="/sign-up/*" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage mode="signUp" />} />

      {/* Legacy routes — redirect to Clerk paths */}
      <Route path="/login"    element={<Navigate to="/sign-in" replace />} />
      <Route path="/register" element={<Navigate to="/sign-up" replace />} />
      <Route path="/otp"             element={<OTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-phone"    element={<VerifyPhonePage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/waste"             element={<ProtectedRoute><WasteLogPage  /></ProtectedRoute>} />
      <Route path="/impact"            element={<ProtectedRoute><ImpactPage    /></ProtectedRoute>} />
      <Route path="/shop"              element={<ProtectedRoute><ShopPage      /></ProtectedRoute>} />
      <Route path="/community"         element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/profile"           element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
      <Route path="/learn"             element={<ProtectedRoute><LearnPage        /></ProtectedRoute>} />
      <Route path="/quiz"              element={<ProtectedRoute><QuizPage         /></ProtectedRoute>} />
      <Route path="/quiz-result"       element={<ProtectedRoute><QuizResultPage   /></ProtectedRoute>} />
      <Route path="/scan-result"       element={<ProtectedRoute><ScanResultPage          /></ProtectedRoute>} />
      <Route path="/waste-history"     element={<ProtectedRoute><WasteHistoryPage         /></ProtectedRoute>} />
      <Route path="/challenge-progress" element={<ProtectedRoute><ChallengeProgressPage    /></ProtectedRoute>} />
      <Route path="/event-detail"      element={<ProtectedRoute><EventDetailPage          /></ProtectedRoute>} />
      <Route path="/weekly-challenges" element={<ProtectedRoute><WeeklyChallengesPage     /></ProtectedRoute>} />
      <Route path="/analytics"         element={<Navigate to="/impact" replace />} />

      {/* Fallback */}
      <Route path="/"  element={<Navigate to={isSignedIn ? "/dashboard" : "/sign-in"} replace />} />
      <Route path="*"  element={<Navigate to={isSignedIn ? "/dashboard" : "/sign-in"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
