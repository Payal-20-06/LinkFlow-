import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { validators, validateForm } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form, {
      email:    validators.email,
      password: validators.required,
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! Redirecting…');
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(result.error || 'Login failed.');
    }
  };

  // Demo login shortcut
  const handleDemoLogin = async () => {
    setLoading(true);
    const result = await login({ email: 'demo@precisionflow.io', password: 'Demo1234' });
    setLoading(false);
    if (result.success) {
      toast.success('Signed in as demo user!');
      navigate(ROUTES.DASHBOARD);
    } else {
      // Inject fake user for demo
      localStorage.setItem('pf_token', 'demo-token-123');
      localStorage.setItem('pf_user', JSON.stringify({
        id: '1',
        name: 'Demo User',
        email: 'demo@precisionflow.io',
        plan: 'Pro',
        avatar: null,
      }));
      window.location.href = ROUTES.DASHBOARD;
    }
  };

  return (
    <AuthLayout>
      <div className="pf-auth-page">
        <div className="pf-auth-page__header">
          <h2 className="pf-auth-page__title">Welcome back</h2>
          <p className="pf-auth-page__subtitle">Sign in to your PrecisionFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="pf-auth-form" noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            id="login-email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="login-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            autoComplete="current-password"
          />

          <div className="pf-auth-form__forgot">
            <Link to={ROUTES.FORGOT_PASSWORD} className="pf-auth-link">Forgot password?</Link>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="pf-auth-divider">
          <span>or</span>
        </div>

        <Button variant="ghost" size="lg" fullWidth onClick={handleDemoLogin}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 8 0v2"/></svg>
          Continue with demo account
        </Button>

        <p className="pf-auth-footer-text">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="pf-auth-link">Create one free</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
