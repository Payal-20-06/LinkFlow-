import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="pf-auth-layout">
      {/* Left panel — branding */}
      <div className="pf-auth-panel pf-auth-panel--brand">
        <div className="pf-auth-brand">
          <div className="pf-auth-brand__logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--color-primary)" strokeLinejoin="round"/>
            </svg>
            <span>Precision<span>Flow</span></span>
          </div>
          <h1 className="pf-auth-brand__headline">
            Shorten. Track.<br/>
            <span className="gradient-text">Analyze.</span>
          </h1>
          <p className="pf-auth-brand__sub">
            Enterprise-grade URL intelligence for developers and teams who care about performance.
          </p>

          {/* Stats */}
          <div className="pf-auth-stats">
            {[
              { value: '50M+', label: 'Links Shortened' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '180+', label: 'Countries' },
            ].map((s) => (
              <div key={s.label} className="pf-auth-stat">
                <span className="pf-auth-stat__value">{s.value}</span>
                <span className="pf-auth-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="pf-auth-orb pf-auth-orb--1" aria-hidden="true" />
        <div className="pf-auth-orb pf-auth-orb--2" aria-hidden="true" />
      </div>

      {/* Right panel — form */}
      <div className="pf-auth-panel pf-auth-panel--form">
        <div className="pf-auth-form-container anim-fadeInUp">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
