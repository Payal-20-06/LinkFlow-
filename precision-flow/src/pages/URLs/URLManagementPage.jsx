import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Badge from '../../components/Badge/Badge';
import Modal from '../../components/Modal/Modal';
import useToast from '../../hooks/useToast';
import useDebounce from '../../hooks/useDebounce';
import { formatNumber, formatRelativeTime, copyToClipboard, truncateUrl } from '../../utils/formatters';
import { validators } from '../../utils/validators';
import { urlService } from '../../services/urlService';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';
import './URLManagementPage.css';

const SORT_OPTIONS = [
  { value: 'clicks_desc', label: 'Most Clicks' },
  { value: 'clicks_asc', label: 'Least Clicks' },
  { value: 'date_desc', label: 'Newest' },
  { value: 'date_asc', label: 'Oldest' },
];

const PAGE_SIZE = 8;

const URLManagementPage = () => {
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [qrUrl, setQrUrl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newForm, setNewForm] = useState({ destination: '', slug: '', title: '' });
  const [editForm, setEditForm] = useState({ destination: '', title: '' });
  const [formError, setFormError] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // ── Load URLs from real API ────────────────────────────────────────────────
  const loadUrls = useCallback(async () => {
    setLoading(true);
    try {
      const data = await urlService.getUrls({ skip: 0, limit: 100 });
      setUrls(data.urls || []);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to load URLs.');
      toast.error(msg);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  // ── Client-side filter + sort (over the full loaded set) ──────────────────
  const filtered = useMemo(() => {
    let data = [...urls];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(
        (u) =>
          u.short?.toLowerCase().includes(q) ||
          u.destination?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((u) => u.status === statusFilter);
    }
    switch (sort) {
      case 'clicks_desc': data.sort((a, b) => b.clicks - a.clicks); break;
      case 'clicks_asc':  data.sort((a, b) => a.clicks - b.clicks); break;
      case 'date_desc':   data.sort((a, b) => new Date(b.created) - new Date(a.created)); break;
      case 'date_asc':    data.sort((a, b) => new Date(a.created) - new Date(b.created)); break;
      default: break;
    }
    return data;
  }, [urls, debouncedSearch, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopy = async (url) => {
    await copyToClipboard(url);
    toast.success(`Copied ${url}`);
  };

  const handleCreate = async (e) => {
    e?.preventDefault();
    const urlErr = validators.url(newForm.destination);
    if (urlErr) { setFormError(urlErr); return; }
    setSaving(true);
    try {
      await urlService.createUrl({
        original_url: newForm.destination,
        custom_slug: newForm.slug || undefined,
        title: newForm.title || undefined,
      });
      toast.success('Short link created!');
      setNewForm({ destination: '', slug: '', title: '' });
      setFormError('');
      setCreateOpen(false);
      loadUrls(); // Refresh list from API
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to create link.');
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (url) => {
    setEditTarget(url);
    setEditForm({ destination: url.destination, title: url.title || '' });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await urlService.updateUrl(editTarget.id, {
        original_url: editForm.destination,
        title: editForm.title || undefined,
      });
      toast.success('Link updated!');
      setEditTarget(null);
      loadUrls();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to update link.');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await urlService.deleteUrl(deleteTarget.id);
      toast.success(`${deleteTarget.short} deleted.`);
      setDeleteTarget(null);
      loadUrls();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || 'Failed to delete link.');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (url) => {
    try {
      await urlService.updateUrl(url.id, { is_active: url.status !== 'active' });
      toast.info('Link status updated.');
      loadUrls();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <DashboardLayout title="URL Manager">
      <div className="pf-urls">
        {/* Header bar */}
        <div className="pf-urls__header">
          <div className="pf-urls__search">
            <Input
              placeholder="Search links or destinations…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>

          <div className="pf-urls__controls">
            {/* Status filter */}
            <div className="pf-urls__filters">
              {['all', 'active', 'paused'].map((s) => (
                <button
                  key={s}
                  className={`pf-filter-btn ${statusFilter === s ? 'pf-filter-btn--active' : ''}`}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="pf-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <Button
              variant="primary"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
              onClick={() => setCreateOpen(true)}
            >
              New link
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="pf-url-table-wrap">
            <div className="pf-utbl__head">
              <span>Short Link</span>
              <span>Destination</span>
              <span>Clicks</span>
              <span>Created</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="pf-utbl__empty">
                <p>Loading your links…</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="pf-utbl__empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <p>{urls.length === 0 ? 'No links yet. Create your first one!' : 'No links match your filter.'}</p>
              </div>
            ) : (
              paginated.map((url) => (
                <div key={url.id} className="pf-utbl__row">
                  <div className="pf-utbl__short">
                    <a href={url.short} target="_blank" rel="noopener noreferrer" className="mono" style={{ textDecoration: 'none', color: 'var(--color-primary)' }}>{url.short}</a>
                    {url.tags?.map((t) => <Badge key={t} size="sm" variant="outline">{t}</Badge>)}
                  </div>

                  <div className="pf-utbl__dest">
                    <span title={url.destination}>{truncateUrl(url.destination, 45)}</span>
                  </div>

                  <div className="pf-utbl__clicks">
                    <strong>{formatNumber(url.clicks)}</strong>
                  </div>

                  <div className="pf-utbl__date">
                    {url.created ? formatRelativeTime(url.created) : '—'}
                  </div>

                  <div>
                    <Badge
                      variant={url.status === 'active' ? 'success' : 'default'}
                      dot
                    >
                      {url.status}
                    </Badge>
                  </div>

                  <div className="pf-utbl__actions">
                    <button className="pf-utbl__action-btn" onClick={() => handleCopy(url.short)} title="Copy">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    <button
                      className="pf-utbl__action-btn"
                      onClick={() => handleToggleStatus(url)}
                      title={url.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {url.status === 'active'
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      }
                    </button>
                    <button className="pf-utbl__action-btn" onClick={() => setQrUrl(url)} title="QR Code">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <rect x="7" y="7" width="3" height="3"/>
                        <rect x="14" y="7" width="3" height="3"/>
                        <rect x="7" y="14" width="3" height="3"/>
                        <rect x="14" y="14" width="3" height="3"/>
                      </svg>
                    </button>
                    <button className="pf-utbl__action-btn" onClick={() => handleEditOpen(url)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="pf-utbl__action-btn pf-utbl__action-btn--danger"
                      onClick={() => setDeleteTarget(url)}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pf-utbl__pagination">
              <span className="pf-utbl__page-info">
                {filtered.length} links — page {page} of {totalPages}
              </span>
              <div className="pf-utbl__page-btns">
                <button className="pf-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pf-page-btn ${p === page ? 'pf-page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="pf-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setFormError(''); setNewForm({ destination: '', slug: '', title: '' }); }}
        title="Create Short Link"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>Create link</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="pf-create-form">
          <Input
            label="Destination URL *"
            type="url"
            placeholder="https://your-long-url.com/..."
            value={newForm.destination}
            onChange={(e) => { setNewForm((p) => ({ ...p, destination: e.target.value })); setFormError(''); }}
            error={formError}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            }
          />
          <Input
            label="Custom slug (optional)"
            type="text"
            placeholder="e.g. my-launch (leave blank for random)"
            value={newForm.slug}
            onChange={(e) => setNewForm((p) => ({ ...p, slug: e.target.value }))}
            hint="Only letters, numbers, hyphens, and underscores"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />
          <Input
            label="Title (optional)"
            type="text"
            placeholder="e.g. Product Launch 2025"
            value={newForm.title}
            onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))}
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Link"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave} loading={saving}>Save changes</Button>
          </>
        }
      >
        {editTarget && (
          <div className="pf-create-form">
            <Input
              label="Destination URL"
              type="url"
              value={editForm.destination}
              onChange={(e) => setEditForm((p) => ({ ...p, destination: e.target.value }))}
            />
            <Input
              label="Title"
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Link"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        {deleteTarget && (
          <p style={{ color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: 1.6 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{deleteTarget.short}</strong>?
            This action is permanent and cannot be undone.
          </p>
        )}
      </Modal>

      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}
    </DashboardLayout>
  );
};

export default URLManagementPage;
