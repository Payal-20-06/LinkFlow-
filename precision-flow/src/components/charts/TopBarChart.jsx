import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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
        <p key={p.dataKey} style={{ color: '#d0bfec', fontWeight: 600, margin: 0 }}>
          {p.value?.toLocaleString()} clicks
        </p>
      ))}
    </div>
  );
};

const TopBarChart = ({ data = [], height = 240, dataKey = 'clicks', nameKey = 'country' }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
      <CartesianGrid stroke="var(--color-outline-variant)" strokeDasharray="4 4" horizontal={false} />
      <XAxis
        type="number"
        tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11, fontFamily: 'var(--font-body)' }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
      />
      <YAxis
        type="category"
        dataKey={nameKey}
        tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontFamily: 'var(--font-body)' }}
        axisLine={false}
        tickLine={false}
        width={80}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(208,191,236,0.06)' }} />
      <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={20}>
        {data.map((_, i) => (
          <Cell key={i} fill={i === 0 ? '#d0bfec' : i === 1 ? '#cdc2dc' : 'var(--color-surface-container-highest)'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default TopBarChart;
