'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { KPICard } from './KPICard';
import { RevenueChart } from './RevenueChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { SalesService } from '@/services/sales';
import { logActionEvent } from '@/services/actionEvents';
import { SalesMetrics, SalesActivity } from '@/types';

interface RevenuePoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface PipelineStage {
  name: string;
  value: number;
  deals: number;
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [recentActivity, setRecentActivity] = useState<SalesActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  const visibleActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 3);

  async function handleShareSnapshot() {
    setLoadingAction('share-snapshot');
    const canShare = typeof navigator.share === 'function';
    const snapshotText = [
      'Sales Intelligence Snapshot',
      `Total Revenue: $${metrics?.totalRevenue.value.toLocaleString() || '0'}`,
      `Deals Won: ${metrics?.dealsWon.value || 0}`,
      `Win Rate: ${(metrics?.winRate.value || 0).toFixed(1)}%`,
      `Average Deal Size: $${Math.round(metrics?.avgDealSize.value || 0).toLocaleString()}`,
      '',
      `Generated on: ${new Date().toLocaleString()}`,
      `URL: ${window.location.href}`,
    ].join('\n');

    try {
      if (canShare) {
        await navigator.share({
          title: 'Sales Dashboard Snapshot',
          text: snapshotText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(snapshotText);
      }

      const message = canShare ? 'Snapshot shared successfully.' : 'Snapshot copied to clipboard.';
      showToast('success', message);
      await logActionEvent({ area: 'dashboard', action: 'share_snapshot', status: 'success', detail: message });
    } catch {
      const message = 'Unable to share snapshot. Please try again.';
      showToast('error', message);
      await logActionEvent({ area: 'dashboard', action: 'share_snapshot', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleCreateBriefing() {
    setLoadingAction('create-briefing');
    try {
      const topPipelineStage = pipelineData[0]?.name || 'N/A';
      const briefing = [
        '# Daily Revenue Briefing',
        '',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        '## KPI Summary',
        `- Total Revenue: $${metrics?.totalRevenue.value.toLocaleString() || '0'}`,
        `- Deals Won: ${metrics?.dealsWon.value || 0}`,
        `- Win Rate: ${(metrics?.winRate.value || 0).toFixed(1)}%`,
        `- Average Deal Size: $${Math.round(metrics?.avgDealSize.value || 0).toLocaleString()}`,
        '',
        '## Pipeline Notes',
        `- Top Stage by Value: ${topPipelineStage}`,
        `- Stages Tracked: ${pipelineData.length}`,
        '',
        '## Recommended Focus',
        '- Prioritize high-value opportunities in negotiation stage.',
        '- Review blocked deals in pipeline overview.',
        '- Follow up on recent activity items with open next steps.',
      ].join('\n');

      const blob = new Blob([briefing], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-briefing-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const message = 'Briefing generated and downloaded.';
      showToast('success', message);
      await logActionEvent({ area: 'dashboard', action: 'create_briefing', status: 'success', detail: message });
    } catch {
      const message = 'Unable to generate briefing right now.';
      showToast('error', message);
      await logActionEvent({ area: 'dashboard', action: 'create_briefing', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        metricsData,
        revenueTrendData,
        pipelineOverviewData,
        recentActivityData,
      ] = await Promise.all([
        SalesService.getSalesMetrics(),
        SalesService.getRevenueTrend(),
        SalesService.getPipelineOverview(),
        SalesService.getRecentActivity(),
      ]);
      setMetrics(metricsData);
      setRevenueData(revenueTrendData);
      setPipelineData(pipelineOverviewData);
      setRecentActivity(recentActivityData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [fetchData]);

  useEffect(() => {
    const handleImported = () => {
      void fetchData();
    };

    window.addEventListener('sales-data-imported', handleImported);
    return () => {
      window.removeEventListener('sales-data-imported', handleImported);
    };
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="glass-soft rounded-2xl p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Executive command center</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-50">Revenue Intelligence</h2>
            <p className="mt-1 text-sm text-slate-300">Realtime pipeline performance, risk and momentum in one view.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShareSnapshot} isLoading={loadingAction === 'share-snapshot'}>Share Snapshot</Button>
            <Button size="sm" onClick={handleCreateBriefing} isLoading={loadingAction === 'create-briefing'}>Create Briefing</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`$${((metrics?.totalRevenue.value ?? 0) / 1000).toFixed(1)}k`}
          trend={metrics?.totalRevenue.trend}
          loading={loading}
        />
        <KPICard
          title="Deals Won"
          value={(metrics?.dealsWon.value ?? 0).toString()}
          trend={metrics?.dealsWon.trend}
          loading={loading}
        />
        <KPICard
          title="Win Rate"
          value={`${(metrics?.winRate.value ?? 0).toFixed(1)}%`}
          trend={metrics?.winRate.trend}
          loading={loading}
        />
        <KPICard
          title="Avg Deal Size"
          value={`$${((metrics?.avgDealSize.value ?? 0) / 1000).toFixed(1)}k`}
          trend={metrics?.avgDealSize.trend}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData}
            title="Revenue Trend"
            type="line"
            height={300}
          />
        </div>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.map((stage) => (
                <div key={stage.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-200">{stage.name}</span>
                    <span className="text-slate-300">${(stage.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${(stage.value / 150000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{stage.deals} deals</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Activity</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllActivity((prev) => !prev)}
            >
              {showAllActivity ? 'Show Less' : 'View All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleActivity.map((activity) => (
              <div key={activity.id} className="flex items-center rounded-xl border border-slate-700/50 bg-slate-900/35 px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-100">
                  •
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-100">{activity.description}</p>
                  <p className="text-sm text-slate-400">{new Date(activity.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
