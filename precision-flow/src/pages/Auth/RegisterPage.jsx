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

const RegisterPage = () => {
  const { register, googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form, {
      name:            validators.required,
      email:           validators.email,
      password:        validators.password,
      confirmPassword: (v, f) => validators.confirmPassword(v, f.password),
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      toast.success('Account created! Welcome to PrecisionFlow.');
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(result.error || 'Registration failed.');
    }
  };

  const handleGoogleSignUp = async () => {
    const result = await googleLogin();
    if (result.success) {
      toast.success('Account created with Google!');
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(result.error || 'Google sign-up failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="pf-auth-page">
        <div className="pf-auth-page__header">
          <h2 className="pf-auth-page__title">Create your account</h2>
          <p className="pf-auth-page__subtitle">Free forever. No credit card required.</p>
        </div>

        {/* Auth method buttons */}
        {!showEmailForm && (
          <div className="pf-auth-methods anim-fadeInUp">
            <button
              className="pf-auth-method-btn pf-auth-method-btn--email"
              onClick={() => setShowEmailForm(true)}
              id="register-email-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Sign up with email
            </button>

            <button
              className="pf-auth-method-btn pf-auth-method-btn--google"
              onClick={handleGoogleSignUp}
              id="register-google-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        )}

        {/* Email/password form */}
        {showEmailForm && (
          <div className="pf-auth-email-form anim-fadeInUp">
            <button
              className="pf-auth-back-btn"
              onClick={() => setShowEmailForm(false)}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to sign-up options
            </button>

            <form onSubmit={handleSubmit} className="pf-auth-form" noValidate>
              <Input
                label="Full name"
                type="text"
                name="name"
                id="reg-name"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                autoComplete="name"
              />
              <Input
                label="Email address"
                type="email"
                name="email"
                id="reg-email"
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
                id="reg-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                type="password"
                name="confirmPassword"
                id="reg-confirm"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                autoComplete="new-password"
              />

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Create account
              </Button>
            </form>
          </div>
        )}

        {!showEmailForm && (
          <p className="pf-auth-footer-text">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="pf-auth-link">Log in</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
