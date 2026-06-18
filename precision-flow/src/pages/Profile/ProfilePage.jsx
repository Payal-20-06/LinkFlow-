import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardHeader } from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Badge from '../../components/Badge/Badge';
import Avatar from '../../components/Avatar/Avatar';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name:    user?.name || '',
    email:   user?.email || '',
    company: user?.company || '',
    website: user?.website || '',
    bio:     user?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser(form);
    setSaving(false);
    toast.success('Profile updated successfully!');
  };

  const STATS = [
    { label: 'Links Created', value: '142' },
    { label: 'Total Clicks', value: '28.3K' },
    { label: 'Member Since', value: 'Jan 2025' },
    { label: 'Plan', value: 'Pro' },
  ];

  return (
    <DashboardLayout title="Profile">
      <div className="pf-profile">
        {/* Left — avatar + stats */}
        <div className="pf-profile__sidebar">
          <Card padding="md" className="pf-profile__avatar-card">
            <div className="pf-profile__avatar-wrap">
              <Avatar name={user?.name} size="xl" />
              <div className="pf-profile__avatar-info">
                <h2 className="pf-profile__name">{user?.name || 'User'}</h2>
                <p className="pf-profile__email">{user?.email}</p>
                <Badge variant="primary">{user?.plan || 'Pro'}</Badge>
              </div>
            </div>

            <div className="pf-profile__stats">
              {STATS.map((s) => (
                <div key={s.label} className="pf-profile__stat">
                  <span className="pf-profile__stat-value">{s.value}</span>
                  <span className="label-caps text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger zone */}
          <Card padding="md">
            <CardHeader title="Danger Zone" subtitle="Irreversible account actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button variant="ghost" fullWidth>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export my data
              </Button>
              <Button variant="danger" fullWidth onClick={() => toast.warning('Please confirm this via email.')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete account
              </Button>
            </div>
          </Card>
        </div>

        {/* Right — edit form */}
        <div className="pf-profile__main">
          <Card padding="md">
            <CardHeader title="Personal Information" subtitle="Update your profile details" />
            <form onSubmit={handleSave} className="pf-profile__form">
              <div className="pf-profile__form-row">
                <Input label="Full name" name="name" type="text" value={form.name} onChange={handleChange}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                <Input label="Email address" name="email" type="email" value={form.email} onChange={handleChange}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
              </div>
              <div className="pf-profile__form-row">
                <Input label="Company" name="company" type="text" placeholder="Acme Inc." value={form.company} onChange={handleChange} />
                <Input label="Website" name="website" type="url" placeholder="https://you.com" value={form.website} onChange={handleChange} />
              </div>
              <div>
                <label className="pf-input__label" style={{ display: 'block', marginBottom: 4, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, color: 'var(--color-on-surface)' }}>Bio</label>
                <textarea
                  name="bio"
                  className="pf-input"
                  style={{ width: '100%', minHeight: 90, padding: '12px', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius)', color: 'var(--color-on-surface)', fontFamily: 'var(--font-body)', fontSize: 14, resize: 'vertical', outline: 'none' }}
                  placeholder="Tell us about yourself…"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
                <Button type="submit" variant="primary" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
