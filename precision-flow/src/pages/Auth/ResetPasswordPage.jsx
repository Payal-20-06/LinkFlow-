import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import useToast from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password successfully reset!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <AuthLayout>
        <div className="pf-auth-page">
          <div className="pf-auth-page__header">
            <h2 className="pf-auth-page__title">Invalid Link</h2>
            <p className="pf-auth-page__subtitle">
              This password reset link is invalid or missing the security token.
            </p>
          </div>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button variant="primary" size="lg" fullWidth>Request new link</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="pf-auth-page">
        {!success ? (
          <>
            <div className="pf-auth-page__header">
              <h2 className="pf-auth-page__title">Reset your password</h2>
              <p className="pf-auth-page__subtitle">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="pf-auth-form" noValidate>
              <Input
                label="New Password"
                type="password"
                name="password"
                id="reset-password"
                placeholder="Must be at least 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                error={error}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                id="reset-confirm-password"
                placeholder="Must match new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                autoComplete="new-password"
              />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Reset Password
              </Button>
            </form>
          </>
        ) : (
          <div className="pf-auth-success">
            <div className="pf-auth-success__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="pf-auth-success__title">Password Reset!</h3>
            <p className="pf-auth-success__text">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.LOGIN)}>
              Go to Log in
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
