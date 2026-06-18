import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/Button/Button';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <div className="pf-404">
    <div className="pf-404__orb pf-404__orb--1" aria-hidden />
    <div className="pf-404__orb pf-404__orb--2" aria-hidden />

    <div className="pf-404__content anim-fadeInUp">
      <div className="pf-404__code gradient-text">404</div>
      <h1 className="pf-404__title">Link not found</h1>
      <p className="pf-404__desc">
        Looks like this page got shortened too aggressively.
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="pf-404__actions">
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="primary" size="lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to dashboard
          </Button>
        </Link>
        <Link to={ROUTES.HOME}>
          <Button variant="ghost" size="lg">Go home</Button>
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
