import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardHeader } from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { QRCodeSVG } from 'qrcode.react';
import './SettingsPage.css';

const SECTIONS = [
  { id: 'general', label: 'General', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { id: 'security', label: 'Security', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  { id: 'notifications', label: 'Notifications', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { id: 'api', label: 'API & Integrations', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { id: 'billing', label: 'Billing & Plan', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
];

const Toggle = ({ checked, onChange, label }) => (
  <label className="pf-toggle">
    <span className="pf-toggle__label">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`pf-toggle__track ${checked ? 'pf-toggle__track--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pf-toggle__thumb" />
    </button>
  </label>
);

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const [active, setActive] = useState('general');

  // States
  const [defaultDomain, setDefaultDomain] = useState('pfl.io');
  const [linkExpiry, setLinkExpiry] = useState('never');
  const [trackUtm, setTrackUtm] = useState(true);
  const [enableQrCodes, setEnableQrCodes] = useState(true);
  const [notifications, setNotifications] = useState({
    clickMilestones: true,
    weeklyReport: true,
    securityAlerts: true,
    productUpdates: false,
    marketing: false,
  });
  const [apiKey, setApiKey] = useState('pf_sk_••••••••••••••••••••••••••••••••');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA States
  const [is2faEnabled, setIs2faEnabled] = useState(user?.is_2fa_enabled || false);
  const [setup2faOpen, setSetup2faOpen] = useState(false);
  const [setup2faData, setSetup2faData] = useState(null);
  const [code2fa, setCode2fa] = useState('');
  const [loading2fa, setLoading2fa] = useState(false);

  const handleToggle2fa = async (checked) => {
    if (checked) {
      setLoading2fa(true);
      try {
        const data = await authService.setup2FA();
        setSetup2faData(data);
        setSetup2faOpen(true);
      } catch (err) {
        toast.error('Failed to start 2FA setup');
      } finally {
        setLoading2fa(false);
      }
    } else {
      setLoading2fa(true);
      try {
        await authService.disable2FA();
        setIs2faEnabled(false);
        setSetup2faOpen(false);
        if (user) setUser({ ...user, is_2fa_enabled: false });
        toast.success('2FA disabled successfully');
      } catch (err) {
        toast.error('Failed to disable 2FA');
      } finally {
        setLoading2fa(false);
      }
    }
  };

  const handleVerify2fa = async () => {
    if (!code2fa || code2fa.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setLoading2fa(true);
    try {
      await authService.verify2FA(code2fa);
      setIs2faEnabled(true);
      setSetup2faOpen(false);
      if (user) setUser({ ...user, is_2fa_enabled: true });
      toast.success('2FA enabled successfully!');
      setCode2fa('');
    } catch (err) {
      toast.error('Invalid code. Please try again.');
    } finally {
      setLoading2fa(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error('All fields are required.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      await authService.changePassword({
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      toast.success('Password updated successfully!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update password.';
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleSave = () => toast.success('Settings saved!');
  const handleCopyApi = () => { navigator.clipboard.writeText('pf_sk_demo_key_123456789'); toast.success('API key copied!'); };
  const handleRegenerateApi = () => toast.warning('A new API key was generated. Old key is now invalid.');

  const renderSection = () => {
    switch (active) {
      case 'general':
        return (
          <div className="pf-settings__form">
            <Card padding="md">
              <CardHeader title="Link Defaults" subtitle="Configure default behavior for new links" />
              <div className="pf-settings__fields">
                <div className="pf-settings__field-row">
                  <div>
                    <p className="pf-settings__field-label">Default domain</p>
                    <p className="pf-settings__field-hint">Which domain to use for shortened links</p>
                  </div>
                  <select
                    className="pf-sort-select"
                    value={defaultDomain}
                    onChange={(e) => setDefaultDomain(e.target.value)}
                  >
                    <option value="pfl.io">pfl.io</option>
                    <option value="your-brand.com">your-brand.com</option>
                  </select>
                </div>
                <div className="pf-settings__divider" />
                <div className="pf-settings__field-row">
                  <div>
                    <p className="pf-settings__field-label">Default link expiry</p>
                    <p className="pf-settings__field-hint">When links expire by default</p>
                  </div>
                  <select
                    className="pf-sort-select"
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value)}
                  >
                    <option value="never">Never</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>
                <div className="pf-settings__divider" />
                <Toggle
                  label="Track UTM parameters automatically"
                  checked={trackUtm}
                  onChange={() => setTrackUtm(!trackUtm)}
                />
                <div className="pf-settings__divider" />
                <Toggle
                  label="Enable QR codes for all links"
                  checked={enableQrCodes}
                  onChange={() => setEnableQrCodes(!enableQrCodes)}
                />
              </div>
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSave}>Save preferences</Button>
              </div>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="pf-settings__form">
            <Card padding="md">
              <CardHeader title="Change Password" subtitle="Must be at least 8 characters with 1 uppercase and 1 number" />
              <div className="pf-settings__fields" style={{ maxWidth: 420 }}>
                <Input label="Current password" type="password" name="current" value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} />
                <Input label="New password" type="password" name="next" value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} />
                <Input label="Confirm new password" type="password" name="confirm" value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
                <Button variant="primary" onClick={handlePasswordUpdate} loading={pwLoading}>
                  Update password
                </Button>
              </div>
            </Card>

            <Card padding="md">
              <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" />
              <div className="pf-settings__fields">
                <Toggle 
                  label="Enable 2FA via authenticator app" 
                  checked={is2faEnabled || setup2faOpen} 
                  onChange={handleToggle2fa} 
                />
                
                {setup2faOpen && setup2faData && (
                  <div style={{ marginTop: 16, padding: '24px', background: 'var(--color-surface-container-high)', borderRadius: 'var(--radius)', border: '1px solid var(--color-surface-container-highest)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Scan this QR Code</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                      Open Google Authenticator or Authy and scan the code below.
                    </p>
                    <div style={{ background: 'white', padding: 16, display: 'inline-block', borderRadius: 8, marginBottom: 16 }}>
                      <QRCodeSVG value={setup2faData.provisioning_uri} size={160} />
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                      Or enter this code manually: <strong className="mono" style={{ color: 'var(--color-on-surface)' }}>{setup2faData.secret}</strong>
                    </p>
                    <div style={{ maxWidth: 200 }}>
                      <Input 
                        label="6-digit code" 
                        value={code2fa} 
                        onChange={(e) => setCode2fa(e.target.value)} 
                        maxLength={6}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <Button variant="primary" onClick={handleVerify2fa} loading={loading2fa}>Verify & Enable</Button>
                      <Button variant="ghost" onClick={() => setSetup2faOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="pf-settings__divider" />
                <Toggle label="Require 2FA for team members" checked={false} onChange={() => {}} />
              </div>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="pf-settings__form">
            <Card padding="md">
              <CardHeader title="Email Notifications" subtitle="Choose what you'd like to be notified about" />
              <div className="pf-settings__fields">
                {Object.entries({
                  clickMilestones: 'Click milestones (100, 1K, 10K…)',
                  weeklyReport: 'Weekly analytics digest',
                  securityAlerts: 'Security alerts and sign-ins',
                  productUpdates: 'Product updates and new features',
                  marketing: 'Tips and promotional content',
                }).map(([key, label]) => (
                  <React.Fragment key={key}>
                    <Toggle
                      label={label}
                      checked={notifications[key]}
                      onChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))}
                    />
                    <div className="pf-settings__divider" />
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSave}>Save preferences</Button>
              </div>
            </Card>
          </div>
        );

      case 'api':
        return (
          <div className="pf-settings__form">
            <Card padding="md">
              <CardHeader title="API Key" subtitle="Use this key to authenticate API requests" />
              <div className="pf-settings__api-key">
                <div className="pf-api-key-display">
                  <span className="mono">
                    {apiKeyVisible ? 'pf_sk_demo_key_1234567890abcdef' : apiKey}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="pf-utbl__action-btn" onClick={() => setApiKeyVisible((v) => !v)} title="Show/hide">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button className="pf-utbl__action-btn" onClick={handleCopyApi} title="Copy">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', margin: 0 }}>
                  This key has full access to your account. Never share it publicly.
                </p>
                <Button variant="danger" size="sm" onClick={handleRegenerateApi}>Regenerate API key</Button>
              </div>
            </Card>
            <Card padding="md">
              <CardHeader title="Base URL" subtitle="Your API base endpoint" />
              <div className="pf-api-key-display">
                <span className="mono" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}
                </span>
              </div>
            </Card>
          </div>
        );

      case 'billing':
        return (
          <div className="pf-settings__form">
            <Card padding="md">
              <div className="pf-billing-plan">
                <div>
                  <p className="label-caps text-muted">Current plan</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 4px' }}>Pro</h3>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, margin: 0 }}>$29/month · Renews July 18, 2025</p>
                </div>
                <Button variant="ghost">Manage subscription</Button>
              </div>
              <div className="pf-billing-features">
                {['500 links/month', 'Unlimited clicks', 'Custom domains', 'Advanced analytics', 'API access', 'Priority support'].map((f) => (
                  <div key={f} className="pf-billing-feature">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="pf-settings">
        {/* Sidebar nav */}
        <div className="pf-settings__nav">
          <Card padding="sm">
            <nav>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`pf-settings__nav-item ${active === s.id ? 'pf-settings__nav-item--active' : ''}`}
                  onClick={() => setActive(s.id)}
                >
                  <span className="pf-settings__nav-icon">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="pf-settings__content anim-fadeIn">
          {renderSection()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
