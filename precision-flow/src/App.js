import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ToastContainer from './components/Toast/Toast';

// Pages
import LandingPage      from './pages/Landing/LandingPage';
import LoginPage        from './pages/Auth/LoginPage';
import RegisterPage     from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/Auth/ResetPasswordPage';
import DashboardPage    from './pages/Dashboard/DashboardPage';
import URLManagementPage from './pages/URLs/URLManagementPage';
import AnalyticsPage    from './pages/Analytics/AnalyticsPage';
import SettingsPage     from './pages/Settings/SettingsPage';
import ProfilePage      from './pages/Profile/ProfilePage';
import NotFoundPage     from './pages/NotFound/NotFoundPage';

import { ROUTES } from './utils/constants';
import './styles/globals.css';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.HOME}            element={<LandingPage />} />
          <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
          <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPasswordPage />} />

          {/* Protected */}
          <Route path={ROUTES.DASHBOARD}  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path={ROUTES.URLS}       element={<ProtectedRoute><URLManagementPage /></ProtectedRoute>} />
          <Route path={ROUTES.ANALYTICS}  element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path={ROUTES.SETTINGS}   element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path={ROUTES.PROFILE}    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="/404"  element={<NotFoundPage />} />
          <Route path="*"     element={<Navigate to="/404" replace />} />
        </Routes>

        {/* Global toast notifications */}
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
