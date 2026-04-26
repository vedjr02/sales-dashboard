'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';

const pipelineVelocity = [
  { month: 'Jan', won: 11, cycle: 42 },
  { month: 'Feb', won: 14, cycle: 39 },
  { month: 'Mar', won: 18, cycle: 34 },
  { month: 'Apr', won: 17, cycle: 32 },
  { month: 'May', won: 22, cycle: 29 },
  { month: 'Jun', won: 24, cycle: 27 },
];

const segmentLift = [
  { segment: 'Mid-Market', value: 36 },
  { segment: 'Enterprise', value: 28 },
  { segment: 'SMB', value: 22 },
  { segment: 'Channel', value: 14 },
];

export default function AnalyticsPage() {
  const [showComparison, setShowComparison] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  const areaData = useMemo(
    () =>
      showComparison
        ? pipelineVelocity.map((point) => ({ ...point, won: Math.max(0, point.won - 3) }))
        : pipelineVelocity,
    [showComparison]
  );

  async function handleComparePeriods() {
    setLoadingAction('compare-periods');
    setShowComparison((prev) => !prev);
    const message = showComparison ? 'Switched to current period.' : 'Switched to previous period comparison.';
    showToast('success', message);
    await logActionEvent({ area: 'analytics', action: 'compare_periods', status: 'success', detail: message });
    setLoadingAction(null);
  }

  async function buildDashboard() {
    setLoadingAction('build-dashboard');
    try {
      const payload = {
        generatedAt: new Date().toISOString(),
        pipelineVelocity: areaData,
        segmentContribution: segmentLift,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const message = 'Dashboard payload exported.';
      showToast('success', message);
      await logActionEvent({ area: 'analytics', action: 'build_dashboard', status: 'success', detail: message });
    } catch {
      const message = 'Unable to export dashboard payload.';
      showToast('error', message);
      await logActionEvent({ area: 'analytics', action: 'build_dashboard', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        description="Measure funnel quality, speed and conversion uplift with board-level clarity."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleComparePeriods} isLoading={loadingAction === 'compare-periods'}>Compare Periods</Button>
            <Button size="sm" onClick={buildDashboard} isLoading={loadingAction === 'build-dashboard'}>Build Dashboard</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.94)',
                    border: '1px solid rgba(148,163,184,0.24)',
                    borderRadius: 12,
                    color: '#e2e8f0',
                  }}
                />
                <Area type="monotone" dataKey="won" stroke="#67e8f9" fill="rgba(103,232,249,0.22)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segment Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentLift}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.94)',
                    border: '1px solid rgba(148,163,184,0.24)',
                    borderRadius: 12,
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { label: 'Forecast Accuracy', value: '94.2%', delta: '+6.1%' },
          { label: 'Avg Sales Cycle', value: '31 days', delta: '-9 days' },
          { label: 'Pipeline Coverage', value: '3.7x', delta: '+0.8x' },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-100">{metric.value}</p>
              <p className="mt-1 text-sm text-emerald-300">{metric.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
