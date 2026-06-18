import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { validators, validateForm } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';

const RegisterPage = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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

  const handleDemoRegister = () => {
    localStorage.setItem('pf_token', 'demo-token-123');
    localStorage.setItem('pf_user', JSON.stringify({
      id: '1', name: 'Demo User', email: 'demo@precisionflow.io', plan: 'Pro', avatar: null,
    }));
    toast.success('Demo account created!');
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <AuthLayout>
      <div className="pf-auth-page">
        <div className="pf-auth-page__header">
          <h2 className="pf-auth-page__title">Create your account</h2>
          <p className="pf-auth-page__subtitle">Free forever. No credit card required.</p>
        </div>

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

        <div className="pf-auth-divider"><span>or</span></div>

        <Button variant="ghost" size="lg" fullWidth onClick={handleDemoRegister}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          Try demo — no sign up needed
        </Button>

        <p className="pf-auth-footer-text">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="pf-auth-link">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
