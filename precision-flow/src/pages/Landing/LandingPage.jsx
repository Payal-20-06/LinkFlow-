import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import './LandingPage.css';

const FEATURES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    title: 'Smart Shortening',
    desc: 'Create memorable branded links in milliseconds with custom slugs and domain support.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Deep Analytics',
    desc: 'Real-time click tracking with geographic, device, and referrer breakdowns.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1m5 0h1M9 15h6"/></svg>,
    title: 'QR Generation',
    desc: 'Instantly generate customizable QR codes for any shortened link.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Enterprise Security',
    desc: 'Password protection, expiry dates, and role-based access for teams.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    title: 'API-First',
    desc: 'RESTful API with SDKs for every major language. Build on top of PrecisionFlow.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    title: 'Team Dashboards',
    desc: 'Collaborate with your team on shared workspaces with granular permissions.',
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="pf-landing">
      {/* Nav */}
      <nav className="pf-landing__nav glass">
        <div className="pf-landing__nav-inner">
          <div className="pf-landing__logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--color-primary)"/>
            </svg>
            <span>Precision<span>Flow</span></span>
          </div>
          <div className="pf-landing__nav-actions">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pf-landing__hero" ref={heroRef}>
        <div className="pf-landing__hero-inner">
          <div className="pf-landing__badge anim-fadeIn">
            <span className="pf-landing__badge-dot" />
            Now with AI-powered link scoring
          </div>

          <h1 className="pf-landing__headline display-lg anim-fadeInUp">
            URL Intelligence<br />
            <span className="gradient-text">Without the Noise</span>
          </h1>

          <p className="pf-landing__sub anim-fadeInUp delay-100">
            PrecisionFlow turns every link into a data point. Shorten, brand, and analyze URLs with enterprise precision — built for developers and marketers who demand insight.
          </p>

          <div className="pf-landing__hero-cta anim-fadeInUp delay-200">
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="lg">
                Start for free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="lg">Sign in</Button>
            </Link>
          </div>

          {/* Fake URL shortener preview */}
          <div className="pf-landing__demo anim-fadeInUp delay-300">
            <div className="pf-landing__demo-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <span style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                https://your-very-long-url.com/with/lots/of/parameters?id=12345&ref=campaign
              </span>
            </div>
            <Button variant="primary" size="md">Shorten</Button>
            <div className="pf-landing__demo-output">
              <span className="mono" style={{ color: 'var(--color-primary)' }}>pfl.io/xK9q2</span>
              <button className="pf-landing__copy-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Orbs */}
        <div className="pf-landing__orb pf-landing__orb--1" aria-hidden />
        <div className="pf-landing__orb pf-landing__orb--2" aria-hidden />
        <div className="pf-landing__orb pf-landing__orb--3" aria-hidden />
      </section>

      {/* Stats */}
      <section className="pf-landing__stats">
        {[
          { value: '50M+', label: 'Links Shortened' },
          { value: '2.4B+', label: 'Clicks Tracked' },
          { value: '99.99%', label: 'Uptime' },
          { value: '180+', label: 'Countries' },
        ].map((s) => (
          <div key={s.label} className="pf-landing__stat">
            <span className="pf-landing__stat-value">{s.value}</span>
            <span className="pf-landing__stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="pf-landing__features">
        <div className="pf-landing__section-header">
          <p className="label-caps text-primary">Features</p>
          <h2 className="headline-md" style={{ color: 'var(--color-on-surface)' }}>
            Everything you need to own your links
          </h2>
        </div>
        <div className="pf-landing__features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="pf-landing__feature-card">
              <div className="pf-landing__feature-icon">{f.icon}</div>
              <h3 className="pf-landing__feature-title">{f.title}</h3>
              <p className="pf-landing__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pf-landing__cta">
        <h2 className="headline-md" style={{ color: 'var(--color-on-surface)' }}>
          Ready to level up your links?
        </h2>
        <p className="body-base text-muted">
          Join thousands of developers and teams already using PrecisionFlow.
        </p>
        <Link to={ROUTES.REGISTER}>
          <Button variant="primary" size="lg">Create free account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="pf-landing__footer">
        <div className="pf-landing__footer-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--color-primary)"/>
          </svg>
          PrecisionFlow
        </div>
        <p className="body-sm text-muted">© 2025 PrecisionFlow. Built with precision.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
