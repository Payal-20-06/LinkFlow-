import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import Avatar from '../Avatar/Avatar';
import './Sidebar.css';

const navItems = [
  {
    to: ROUTES.DASHBOARD,
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: ROUTES.URLS,
    label: 'URL Manager',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    to: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: ROUTES.SETTINGS,
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const Sidebar = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className={`pf-sidebar ${className}`}>
      {/* Logo */}
      <div className="pf-sidebar__logo">
        <div className="pf-sidebar__logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="pf-sidebar__logo-text">Precision<span>Flow</span></span>
      </div>

      {/* Nav */}
      <nav className="pf-sidebar__nav" aria-label="Main navigation">
        <ul className="pf-sidebar__nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `pf-sidebar__nav-item ${isActive ? 'pf-sidebar__nav-item--active' : ''}`
                }
              >
                <span className="pf-sidebar__nav-icon">{item.icon}</span>
                <span className="pf-sidebar__nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom — user area */}
      <div className="pf-sidebar__bottom">
        <div className="pf-sidebar__divider" />
        <NavLink
          to={ROUTES.PROFILE}
          className={({ isActive }) =>
            `pf-sidebar__user ${isActive ? 'pf-sidebar__user--active' : ''}`
          }
        >
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="pf-sidebar__user-info">
            <span className="pf-sidebar__user-name">{user?.name || 'User'}</span>
            <span className="pf-sidebar__user-email">{user?.email || ''}</span>
          </div>
        </NavLink>
        <button className="pf-sidebar__logout" onClick={handleLogout} aria-label="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
