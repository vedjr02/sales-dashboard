import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

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
            {loading ? (
              <div className="space-y-3" role="status" aria-label="Loading KPI">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-9 w-32 max-w-[85%]" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium text-slate-300">{title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-slate-100">{value}</p>
                </div>
                {trend ? (
                  <div
                    className={`mt-2 text-sm font-medium ${
                      trend.direction === 'up' ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </div>
                ) : null}
              </>
            )}
          </div>
          {icon && !loading ? <div className="ml-4 text-slate-300">{icon}</div> : null}
          {loading && icon ? (
            <div className="ml-4" aria-hidden>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
