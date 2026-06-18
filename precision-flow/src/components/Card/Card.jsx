import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glass = false,
  onClick,
  ...props
}) => {
  const classes = [
    'pf-card',
    `pf-card--pad-${padding}`,
    hover ? 'pf-card--hover' : '',
    glass ? 'pf-card--glass' : '',
    onClick ? 'pf-card--clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`pf-card__header ${className}`}>
    <div className="pf-card__header-text">
      {title && <h3 className="pf-card__title">{title}</h3>}
      {subtitle && <p className="pf-card__subtitle">{subtitle}</p>}
    </div>
    {action && <div className="pf-card__header-action">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`pf-card__body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pf-card__footer ${className}`}>{children}</div>
);

export default Card;
