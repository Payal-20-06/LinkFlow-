import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    'pf-btn',
    `pf-btn--${variant}`,
    `pf-btn--${size}`,
    fullWidth ? 'pf-btn--full' : '',
    loading ? 'pf-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="pf-btn__spinner" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="pf-btn__icon pf-btn__icon--left">{icon}</span>
      )}
      <span className="pf-btn__label">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="pf-btn__icon pf-btn__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default Button;
