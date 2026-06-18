// ── Date formatters ──
export const formatDate = (dateStr, opts = {}) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(date);
};

export const formatRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// ── Number formatters ──
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
};

export const formatPercent = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

// ── URL helpers ──
export const truncateUrl = (url, maxLen = 50) => {
  try {
    const clean = url.replace(/^https?:\/\//, '');
    return clean.length > maxLen ? clean.substring(0, maxLen) + '…' : clean;
  } catch {
    return url;
  }
};

export const getShortCode = (shortUrl) => {
  try {
    return shortUrl.split('/').pop();
  } catch {
    return shortUrl;
  }
};

export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// ── Copy to clipboard ──
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

// ── Color helpers for charts ──
export const getStatusColor = (status) => {
  const map = {
    active: '#d0bfec',
    inactive: '#afa9b3',
    expired: '#f97386',
    paused: '#ffd8ee',
  };
  return map[status] || map.inactive;
};
