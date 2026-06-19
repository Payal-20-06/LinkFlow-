import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-container-highest)',
      border: '1px solid var(--color-outline-variant)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
    }}>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4, fontSize: 12 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600, margin: 0 }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const ClickTrendChart = ({ data = [], height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="var(--chart-primary)" stopOpacity={0.25} />
          <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="var(--chart-secondary)" stopOpacity={0.2} />
          <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="var(--color-outline-variant)" strokeDasharray="4 4" vertical={false} />
      <XAxis
        dataKey="date"
        tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11, fontFamily: 'var(--font-body)' }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11, fontFamily: 'var(--font-body)' }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
      />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey="clicks"
        name="Total Clicks"
        stroke="var(--chart-primary)"
        strokeWidth={2}
        fill="url(#clickGrad)"
        dot={false}
        activeDot={{ r: 5, fill: 'var(--chart-primary)', stroke: '#0f0d11', strokeWidth: 2 }}
      />
      <Area
        type="monotone"
        dataKey="unique"
        name="Unique Visitors"
        stroke="var(--chart-secondary)"
        strokeWidth={2}
        fill="url(#uniqueGrad)"
        dot={false}
        activeDot={{ r: 5, fill: 'var(--chart-secondary)', stroke: '#0f0d11', strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default ClickTrendChart;
