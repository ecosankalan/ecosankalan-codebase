import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppwriteProvider } from '@appwrite.io/react';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import CommandMenu from './components/common/CommandMenu';
import { FullscreenLoader } from './components/common/Loader';
import useListener from './hooks/useListener';
import { NotificationProvider } from "./context/NotificationContext";

import { StatsProvider } from './context/StatsContext';

// ── Pages ────────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage';
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
import ShopSearchPage      from './pages/ShopSearchPage';
import CommunityPage       from './pages/CommunityPage';
import ProfilePage         from './pages/ProfilePage';
import LearnPage           from './pages/LearnPage';
import QuizPage            from './pages/QuizPage';
import QuizResultPage      from './pages/QuizResultPage';
import ScanResultPage      from './pages/ScanResultPage';
import WasteHistoryPage    from './pages/WasteHistoryPage';
import ChallengeDetailPage     from './pages/ChallengeDetailPage';
import EventDetailPage        from './pages/EventDetailPage';
import WeeklyChallengesPage   from './pages/WeeklyChallengesPage';
import ProductDetailPage      from './pages/ProductDetailPage';
import VouchersPage           from './pages/VouchersPage';
import AdminDashboardPage     from './pages/AdminDashboardPage';
import PrivacyPolicyPage      from './pages/PrivacyPolicyPage';
import NotFoundPage           from './pages/NotFoundPage';
import OAuthPage              from './pages/OAuthPage';
import OAuthSuccessPage       from './pages/OAuthSuccessPage';
import OAuthFailurePage       from './pages/OAuthFailurePage';
import OAuthDashboardPage     from './pages/OAuthDashboardPage';

import './styles/global.css';

// ── TanStack Query client for Appwrite React SDK ─────────────────────
const queryClient = new QueryClient();

// ── Protected route: redirects to /login if not authenticated ────────
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullscreenLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Admin route: requires role admin (or ngo where needed) ─────────────
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }, [pathname]);
  return null;
}

function AppRoutes() {
  const { user } = useAuth();
  useListener(user); // Initialize listener when the user is available
  return (
    <Routes>
      {/* Landing page — public, shown to unauthenticated visitors at "/" */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      {/* Public / Auth routes */}
      <Route path="/login"           element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register"        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/auth"            element={<OAuthPage />} />
      <Route path="/auth/success"    element={<OAuthSuccessPage />} />
      <Route path="/auth/failure"    element={<OAuthFailurePage />} />
      <Route path="/oauth-dashboard" element={<OAuthDashboardPage />} />
      <Route path="/verify-email"    element={<OTPPage />} />
      <Route path="/otp"             element={<Navigate to="/verify-email" replace />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-phone"    element={<VerifyPhonePage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/privacy"         element={<PrivacyPolicyPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/waste"     element={<ProtectedRoute><WasteLogPage  /></ProtectedRoute>} />
      <Route path="/impact"    element={<ProtectedRoute><ImpactPage    /></ProtectedRoute>} />
      <Route path="/shop"        element={<ProtectedRoute><ShopPage        /></ProtectedRoute>} />
      <Route path="/shop/search" element={<ProtectedRoute><ShopSearchPage  /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
      <Route path="/learn"        element={<ProtectedRoute><LearnPage        /></ProtectedRoute>} />
      <Route path="/quiz"         element={<ProtectedRoute><QuizPage         /></ProtectedRoute>} />
      <Route path="/quiz-result"  element={<ProtectedRoute><QuizResultPage   /></ProtectedRoute>} />
      <Route path="/scan-result"        element={<ProtectedRoute><ScanResultPage          /></ProtectedRoute>} />
      <Route path="/waste-history"       element={<ProtectedRoute><WasteHistoryPage         /></ProtectedRoute>} />
      <Route path="/challenge/:id"      element={<ProtectedRoute><ChallengeDetailPage      /></ProtectedRoute>} />
      <Route path="/event-detail"        element={<ProtectedRoute><EventDetailPage          /></ProtectedRoute>} />
      <Route path="/weekly-challenges"   element={<ProtectedRoute><WeeklyChallengesPage     /></ProtectedRoute>} />
      <Route path="/product-detail"      element={<ProtectedRoute><ProductDetailPage   /></ProtectedRoute>} />
      <Route path="/vouchers"            element={<ProtectedRoute><VouchersPage         /></ProtectedRoute>} />
      <Route path="/admin"               element={<AdminRoute><AdminDashboardPage     /></AdminRoute>} />
      <Route path="/analytics"           element={<Navigate to="/impact" replace />} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppwriteProvider
          endpoint={import.meta.env.VITE_APPWRITE_ENDPOINT}
          projectId={import.meta.env.VITE_APPWRITE_PROJECT_ID}
        >
          <NotificationProvider>
            <AuthProvider>
              <StatsProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <ScrollToTop />
                  <Toaster
                    position="top-center"
                    gutter={10}
                    toastOptions={{
                      duration: 3500,
                      style: {
                        borderRadius: '16px',
                        background: '#20301A',
                        color: '#FFF8CF',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.87rem',
                        fontWeight: 600,
                        padding: '12px 16px',
                        boxShadow: '0 12px 32px rgba(32,48,26,.35)',
                        border: '1px solid rgba(118,196,87,.35)',
                      },
                      success: { iconTheme: { primary: '#76C457', secondary: '#2A7C13' } },
                    }}
                  />
                  <AppRoutes />
                  <CommandMenu />
                </BrowserRouter>
              </StatsProvider>
            </AuthProvider>
          </NotificationProvider>
        </AppwriteProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
