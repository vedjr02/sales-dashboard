import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'line' | 'bar';
  dataKey?: string;
  height?: number;
}

export function RevenueChart({
  data,
  title,
  type = 'line',
  dataKey = 'value',
  height = 300,
}: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-96 items-center justify-center text-slate-400">
          No data available
        </CardContent>
      </Card>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '12px',
    color: '#e2e8f0',
  };

  const formatCurrency = (value: unknown) => {
    if (Array.isArray(value)) {
      const first = value[0];
      if (typeof first === 'number') {
        return `$${first.toLocaleString()}`;
      }
      if (typeof first === 'string') {
        return first;
      }
      return '$0';
    }
    if (typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    return '$0';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#67e8f9"
                strokeWidth={3}
                dot={{ fill: '#67e8f9', r: 3 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey={dataKey} fill="#67e8f9" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
