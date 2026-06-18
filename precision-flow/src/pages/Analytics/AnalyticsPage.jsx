import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardHeader } from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';
import ClickTrendChart from '../../components/charts/ClickTrendChart';
import DonutChart from '../../components/charts/DonutChart';
import TopBarChart from '../../components/charts/TopBarChart';
import { formatNumber } from '../../utils/formatters';
import { analyticsService } from '../../services/analyticsService';
import './AnalyticsPage.css';

const DATE_RANGES = ['7d', '30d', '90d', '1y'];

// ── Visual chart data (click_events table required for real data — v2) ────────
const genTrend = (days) =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - i - 1) * 86400000);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: Math.floor(600 + Math.sin(i * 0.5) * 400 + Math.random() * 500),
      unique: Math.floor(300 + Math.sin(i * 0.5) * 200 + Math.random() * 300),
    };
  });

const DEVICE_DATA = [
  { name: 'Desktop', value: 48 },
  { name: 'Mobile', value: 37 },
  { name: 'Tablet', value: 11 },
  { name: 'Other', value: 4 },
];

const GEO_DATA = [
  { country: 'United States', clicks: 9210 },
  { country: 'India', clicks: 4870 },
  { country: 'Germany', clicks: 3120 },
  { country: 'UK', clicks: 2890 },
  { country: 'Canada', clicks: 1740 },
];

const REFERRER_DATA = [
  { country: 'Direct', clicks: 10400 },
  { country: 'Twitter/X', clicks: 7200 },
  { country: 'LinkedIn', clicks: 4100 },
  { country: 'Google', clicks: 3800 },
  { country: 'Reddit', clicks: 1900 },
];

const AnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const trendData = genTrend(Math.min(days, 30));

  // ── Real data from API ─────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Analytics load failed:', err);
      // Graceful empty state — don't crash the page
      setStats({ total_links: 0, total_clicks: 0, active_links: 0, avg_ctr: 0, top_urls: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── KPI cards from real API data ──────────────────────────────────────────
  const summaryStats = stats
    ? [
        { label: 'Total Clicks', value: formatNumber(stats.total_clicks), up: true },
        { label: 'Total Links', value: formatNumber(stats.total_links), up: true },
        { label: 'Active Links', value: formatNumber(stats.active_links), up: true },
        { label: 'Avg Clicks/Link', value: stats.avg_ctr?.toFixed(1) ?? '0', up: true },
      ]
    : [];

  return (
    <DashboardLayout title="Analytics">
      <div className="pf-analytics">
        {/* Range selector */}
        <div className="pf-analytics__header">
          <div>
            <h2 className="pf-analytics__title">Performance Overview</h2>
            <p className="pf-analytics__sub">Aggregated click analytics across all your links.</p>
          </div>
          <div className="pf-range-selector">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                className={`pf-range-btn ${range === r ? 'pf-range-btn--active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r === '7d' ? '7 days' : r === '30d' ? '30 days' : r === '90d' ? '90 days' : '1 year'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary KPIs — real data */}
        <div className="pf-analytics__kpis">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} padding="sm" className="pf-an-kpi">
                  <div style={{ height: 60, background: 'var(--color-surface-container-high)', borderRadius: 8 }} />
                </Card>
              ))
            : summaryStats.map((s) => (
                <Card key={s.label} padding="sm" className="pf-an-kpi">
                  <p className="label-caps text-muted">{s.label}</p>
                  <p className="pf-an-kpi__value">{s.value}</p>
                </Card>
              ))}
        </div>

        {/* Click trend chart */}
        <Card padding="md">
          <CardHeader
            title="Click Trends"
            subtitle={`Showing ${days} day window`}
            action={
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d0bfec', display: 'inline-block' }} /> Total Clicks
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffd8ee', display: 'inline-block' }} /> Unique Visitors
                </span>
              </div>
            }
          />
          <ClickTrendChart data={trendData} height={300} />
        </Card>

        {/* Device + Geo grid */}
        <div className="pf-analytics__grid">
          <Card padding="md">
            <CardHeader title="Device Breakdown" subtitle="Traffic by device type" />
            <DonutChart data={DEVICE_DATA} height={260} />
          </Card>

          <Card padding="md">
            <CardHeader title="Top Countries" subtitle="Clicks by geographic region" />
            <TopBarChart data={GEO_DATA} height={260} dataKey="clicks" nameKey="country" />
          </Card>

          <Card padding="md">
            <CardHeader title="Top Referrers" subtitle="Traffic sources" />
            <TopBarChart data={REFERRER_DATA} height={260} dataKey="clicks" nameKey="country" />
          </Card>
        </div>

        {/* Top URLs — real data from API */}
        <Card padding="none">
          <CardHeader
            title="Top Links by Clicks"
            subtitle="Best performing links"
            action={<Badge variant="primary">{range}</Badge>}
            className="pf-analytics__table-header"
          />
          <div className="pf-an-table">
            <div className="pf-an-table__head">
              <span>Link</span>
              <span>Clicks</span>
              <span>Status</span>
            </div>
            {loading ? (
              <div style={{ padding: '24px', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>Loading…</div>
            ) : !stats?.top_urls?.length ? (
              <div style={{ padding: '24px', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
                No links yet. Create a URL and start tracking clicks!
              </div>
            ) : (
              stats.top_urls.map((u, i) => (
                <div key={u.id} className="pf-an-table__row">
                  <div className="pf-an-table__rank">
                    <span className="pf-an-table__num">{i + 1}</span>
                    <span className="mono" style={{ color: 'var(--color-primary)', fontSize: 13 }}>
                      {u.short}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    {formatNumber(u.clicks)}
                  </span>
                  <Badge variant="success">active</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
