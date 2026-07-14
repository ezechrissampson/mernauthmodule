import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import OfflineBanner from './components/common/OfflineBanner.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import GuestRoute from './routes/GuestRoute.jsx';

import Landing from './pages/Landing.jsx';
import PostsPage from './pages/PostsPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import ContactSupportPage from './pages/ContactSupportPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ResendVerification from './pages/ResendVerification.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Security from './pages/Security.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import ChangeEmail from './pages/ChangeEmail.jsx';
import DeleteAccount from './pages/DeleteAccount.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Forbidden from './pages/Forbidden.jsx';
import NotFound from './pages/NotFound.jsx';
import ServerError from './pages/ServerError.jsx';
import Offline from './pages/Offline.jsx';
import Maintenance from './pages/Maintenance.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <OfflineBanner />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/contact-support" element={<ContactSupportPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/resend-verification" element={<ResendVerification />} />

              {/* Guest-only */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/security" element={<Security />} />
                <Route path="/security/change-password" element={<ChangePassword />} />
                <Route path="/security/change-email" element={<ChangeEmail />} />
                <Route path="/security/delete-account" element={<DeleteAccount />} />
              </Route>

              {/* Status pages */}
              <Route path="/401" element={<Unauthorized />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
