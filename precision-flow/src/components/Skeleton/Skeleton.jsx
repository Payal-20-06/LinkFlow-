import React from 'react';
import './Skeleton.css';

const Skeleton = ({
  width,
  height = '16px',
  borderRadius,
  className = '',
  style = {},
}) => (
  <span
    className={`pf-skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius: borderRadius || 'var(--radius)',
      ...style,
    }}
    aria-hidden="true"
  />
);

export const SkeletonCard = ({ rows = 3 }) => (
  <div className="pf-skeleton-card">
    <div className="pf-skeleton-card__header">
      <Skeleton width="60%" height="20px" />
      <Skeleton width="80px" height="28px" borderRadius="var(--radius-full)" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} width={`${70 + Math.random() * 30}%`} height="14px" />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="pf-skeleton-table">
    {/* Header */}
    <div className="pf-skeleton-table__row pf-skeleton-table__row--header">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? '40%' : '20%'} height="12px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, ri) => (
      <div key={ri} className="pf-skeleton-table__row">
        {Array.from({ length: cols }).map((_, ci) => (
          <Skeleton key={ci} width={ci === 0 ? '55%' : '25%'} height="14px" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonKPI = () => (
  <div className="pf-skeleton-kpi">
    <div className="pf-skeleton-kpi__top">
      <Skeleton width="120px" height="12px" />
      <Skeleton width="36px" height="36px" borderRadius="var(--radius)" />
    </div>
    <Skeleton width="80px" height="36px" />
    <Skeleton width="100px" height="12px" />
  </div>
);

export default Skeleton;
