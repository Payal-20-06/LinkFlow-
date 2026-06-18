import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="pf-dash-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="pf-dash-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar className={sidebarOpen ? 'pf-sidebar--open' : ''} />

      <div className="pf-dash-main">
        <Navbar
          title={title}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="pf-dash-content page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
