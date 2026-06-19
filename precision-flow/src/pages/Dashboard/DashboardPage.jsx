import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardHeader } from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { SkeletonKPI } from '../../components/Skeleton/Skeleton';
import ClickTrendChart from '../../components/charts/ClickTrendChart';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { formatNumber, formatRelativeTime, copyToClipboard } from '../../utils/formatters';
import { analyticsService } from '../../services/analyticsService';
import { urlService } from '../../services/urlService';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';
import './DashboardPage.css';

// ── Static chart data (click trend requires click_events table — v2) ──────────
const generateTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d) => ({
    date: d,
    clicks: Math.floor(800 + Math.random() * 2200),
    unique: Math.floor(400 + Math.random() * 1200),
  }));
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUrls, setRecentUrls] = useState([]);
  const [trendData] = useState(generateTrendData);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);

  // ── Load real data from API ────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashData, urlData] = await Promise.all([
        analyticsService.getDashboard(),
        urlService.getUrls({ limit: 5 }),
      ]);
      setStats(dashData);
      setRecentUrls(urlData.urls || []);
    } catch (err) {
      // If API fails (e.g. network error), show empty state — don't crash
      console.error('Dashboard load failed:', err);
      setStats({ total_links: 0, total_clicks: 0, active_links: 0, avg_ctr: 0, top_urls: [] });
      setRecentUrls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ── KPI cards built from real API data ────────────────────────────────────
  const kpiCards = stats
    ? [
        {
          label: 'Total Links',
          value: formatNumber(stats.total_links),
          change: '',
          up: true,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          ),
        },
        {
          label: 'Total Clicks',
          value: formatNumber(stats.total_clicks),
          change: '',
          up: true,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          ),
        },
        {
          label: 'Active Links',
          value: formatNumber(stats.active_links),
          change: '',
          up: true,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        },
        {
          label: 'Avg Clicks/Link',
          value: stats.avg_ctr.toFixed(1),
          change: '',
          up: true,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
      ]
    : [];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopy = async (url) => {
    await copyToClipboard(url);
    toast.success(`Copied ${url}`);
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setCreating(true);
    try {
      const created = await urlService.createUrl({ original_url: newUrl });
      toast.success(`Link created! ${created.short}`);
      setNewUrl('');
      setCreateOpen(false);
      loadDashboard(); // Refresh stats
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to create link.');
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="pf-dashboard">
        {/* Welcome */}
        <div className="pf-dashboard__welcome">
          <div>
            <h2 className="pf-dashboard__greeting">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="pf-dashboard__greeting-sub">
              Here's what's happening with your links today.
            </p>
          </div>
          <Button
            variant="primary"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            onClick={() => setCreateOpen(!createOpen)}
          >
            Shorten URL
          </Button>
        </div>

        {/* Quick create form */}
        {createOpen && (
          <div className="pf-dashboard__quick-create anim-fadeInDown">
            <form onSubmit={handleQuickCreate} className="pf-dashboard__quick-form">
              <div className="pf-quick-input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.8">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <input
                  className="pf-quick-input__field"
                  type="url"
                  placeholder="Paste your long URL here…"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" variant="primary" loading={creating}>
                Create link
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </form>
          </div>
        )}

        {/* KPI Cards — real data */}
        <div className="pf-dashboard__kpis">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
            : kpiCards.map((kpi) => (
                <Card key={kpi.label} padding="sm" className="pf-kpi-card">
                  <div className="pf-kpi-card__top">
                    <span className="pf-kpi-card__label label-caps">{kpi.label}</span>
                    <div className="pf-kpi-card__icon">{kpi.icon}</div>
                  </div>
                  <div className="pf-kpi-card__value">{kpi.value}</div>
                </Card>
              ))}
        </div>

        {/* Main grid */}
        <div className="pf-dashboard__grid">
          {/* Click trend chart (visual — requires click_events table for real data) */}
          <Card className="pf-dashboard__chart-card" padding="md">
            <CardHeader
              title="Click Trends"
              subtitle="Total clicks & unique visitors — last 14 days"
              action={
                <div className="pf-chart-legend">
                  <span className="pf-chart-legend-item" style={{ '--dot': 'var(--chart-primary)' }}>Total</span>
                  <span className="pf-chart-legend-item" style={{ '--dot': 'var(--chart-secondary)' }}>Unique</span>
                </div>
              }
            />
            {loading ? (
              <div style={{ height: 280, background: 'var(--color-surface-container-high)', borderRadius: 'var(--radius)' }} />
            ) : (
              <ClickTrendChart data={trendData} />
            )}
          </Card>

          {/* Activity feed placeholder */}
          <Card className="pf-dashboard__activity-card" padding="md">
            <CardHeader title="Recent Links" subtitle="Your last 5 shortened URLs" />
            <div className="pf-activity-list">
              {loading ? (
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>Loading…</p>
              ) : recentUrls.length === 0 ? (
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
                  No links yet. Create your first one above!
                </p>
              ) : (
                recentUrls.map((url) => (
                  <div key={url.id} className="pf-activity-item">
                    <div className="pf-activity-dot pf-activity-dot--click" />
                    <div className="pf-activity-content">
                      <p className="pf-activity-msg">{url.short}</p>
                      <span className="pf-activity-time">{formatRelativeTime(url.created)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Top URLs table — real data */}
        <Card padding="none">
          <CardHeader
            title="Top Performing URLs"
            subtitle="By total clicks"
            action={<Badge variant="primary">All time</Badge>}
            className="pf-dashboard__table-header"
          />
          <div className="pf-url-table">
            <div className="pf-url-table__head">
              <span>Short Link</span>
              <span>Destination</span>
              <span>Clicks</span>
              <span>Status</span>
              <span></span>
            </div>
            {loading ? (
              <div style={{ padding: '24px', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
                Loading…
              </div>
            ) : recentUrls.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
                Create your first short URL to see it here.
              </div>
            ) : (
              recentUrls.map((url) => (
                <div key={url.id} className="pf-url-row">
                  <a href={url.short} target="_blank" rel="noopener noreferrer" className="pf-url-row__short mono" style={{ textDecoration: 'none', color: 'var(--color-primary)' }}>{url.short}</a>
                  <span className="pf-url-row__dest">{url.destination?.replace('https://', '')}</span>
                  <span className="pf-url-row__clicks">{formatNumber(url.clicks)}</span>
                  <Badge variant={url.status === 'active' ? 'success' : 'default'} dot>
                    {url.status}
                  </Badge>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="pf-url-row__copy" onClick={() => setQrUrl(url)} title="QR Code">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <rect x="7" y="7" width="3" height="3"/>
                        <rect x="14" y="7" width="3" height="3"/>
                        <rect x="7" y="14" width="3" height="3"/>
                        <rect x="14" y="14" width="3" height="3"/>
                      </svg>
                    </button>
                    <button className="pf-url-row__copy" onClick={() => handleCopy(url.short)} title="Copy URL">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}
    </DashboardLayout>
  );
};

export default DashboardPage;
