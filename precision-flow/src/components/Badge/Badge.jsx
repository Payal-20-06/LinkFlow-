import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '9999px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    fontSize: size === 'sm' ? '10px' : '11px',
    padding: size === 'sm' ? '2px 8px' : '3px 10px',
    lineHeight: 1.4,
    ...VARIANT_STYLES[variant],
  };

  return (
    <span className={`pf-badge ${className}`} style={styles}>
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
};

const VARIANT_STYLES = {
  default: {
    background: 'var(--color-secondary-container)',
    color: 'var(--color-on-secondary-container)',
  },
  primary: {
    background: 'var(--color-primary-container)',
    color: 'var(--color-on-primary-container)',
  },
  success: {
    background: 'rgba(208, 191, 236, 0.15)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(208, 191, 236, 0.3)',
  },
  warning: {
    background: 'rgba(255, 216, 238, 0.15)',
    color: 'var(--color-tertiary)',
    border: '1px solid rgba(255, 216, 238, 0.3)',
  },
  danger: {
    background: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-on-surface-variant)',
    border: '1px solid var(--color-outline-variant)',
  },
};

export default Badge;
