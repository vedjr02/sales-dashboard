import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  loading = false,
}: KPICardProps) {
  return (
    <Card className="glow-ring transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-slate-300">{title}</p>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-slate-700" />
              ) : (
                <>
                  <p className="text-2xl font-semibold text-slate-100">{value}</p>
                </>
              )}
            </div>
            {trend && !loading && (
              <div
                className={`mt-2 text-sm font-medium ${
                  trend.direction === 'up' ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {icon && <div className="ml-4 text-slate-300">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
