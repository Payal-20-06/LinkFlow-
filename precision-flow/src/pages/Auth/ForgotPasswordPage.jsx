import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import useToast from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { validators } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validators.email(email);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      setSent(true); // Show success even on API error for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="pf-auth-page">
        <Link to={ROUTES.LOGIN} className="pf-auth-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to sign in
        </Link>

        {!sent ? (
          <>
            <div className="pf-auth-page__header">
              <h2 className="pf-auth-page__title">Forgot password?</h2>
              <p className="pf-auth-page__subtitle">
                Enter your email and we'll send you a secure reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="pf-auth-form" noValidate>
              <Input
                label="Email address"
                type="email"
                name="email"
                id="forgot-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                error={error}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                autoComplete="email"
              />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Send reset link
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
            <h3 className="pf-auth-success__title">Check your inbox</h3>
            <p className="pf-auth-success__text">
              We've sent a password reset link to <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>. It expires in 30 minutes.
            </p>
            <Button variant="ghost" size="md" onClick={() => setSent(false)}>
              Try another email
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
