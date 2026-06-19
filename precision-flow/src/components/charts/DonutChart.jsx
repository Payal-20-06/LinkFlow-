import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['var(--chart-primary)', 'var(--chart-secondary)', 'var(--chart-tertiary)', 'var(--chart-4)', 'var(--chart-5)'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'var(--color-surface-container-highest)',
      border: '1px solid var(--color-outline-variant)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
    }}>
      <p style={{ color: d.payload.fill, fontWeight: 600, margin: 0 }}>
        {d.name}: {d.value}%
      </p>
    </div>
  );
};

const DonutChart = ({ data = [], height = 240, innerRadius = 55, outerRadius = 85 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={3}
        dataKey="value"
        strokeWidth={0}
        animationBegin={0}
        animationDuration={800}
      >
        {data.map((entry, i) => (
          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend
        iconType="circle"
        iconSize={8}
        wrapperStyle={{
          fontSize: '12px',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-on-surface-variant)',
          paddingTop: '8px',
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default DonutChart;
