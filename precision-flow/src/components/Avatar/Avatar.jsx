import React from 'react';

const COLORS = [
  '#d0bfec', '#cdc2dc', '#ffd8ee', '#c2b1dd',
  '#bfb4ce', '#edb7d8', '#ebddff', '#dbd0ea',
];

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const px = SIZES[size] || SIZES.md;
  const bg = getColor(name);
  const initials = getInitials(name);
  const fontSize = px * 0.36;

  const style = {
    width: px,
    height: px,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1.5px solid var(--color-outline-variant)',
    fontSize,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    lineHeight: 1,
    background: src ? 'transparent' : bg,
    color: '#1a1a2e',
    userSelect: 'none',
  };

  return (
    <span className={`pf-avatar ${className}`} style={style} aria-label={name || 'User'}>
      {src ? (
        <img
          src={src}
          alt={name || 'User'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        initials
      )}
    </span>
  );
};

export default Avatar;
