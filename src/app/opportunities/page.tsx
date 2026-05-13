'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonKanban, SkeletonTable, SkeletonText } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';
import { SalesService } from '@/services/sales';
import { Opportunity } from '@/types';

interface StageGroup {
  stage: string;
  deals: Opportunity[];
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const stageGroups = useMemo<StageGroup[]>(() => {
    const grouped = opportunities.reduce<Record<string, Opportunity[]>>((acc, item) => {
      const stage = item.stage || 'unknown';
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([stage, deals]) => ({ stage, deals }))
      .sort((a, b) => b.deals.length - a.deals.length);
  }, [opportunities]);

  const analytics = useMemo(() => {
    const withAmount = opportunities.filter((item) => Number.isFinite(item.amount));
    const avgDealSize = withAmount.length > 0
      ? withAmount.reduce((sum, item) => sum + item.amount, 0) / withAmount.length
      : null;

    const withProbability = opportunities.filter((item) => Number.isFinite(item.probability));
    const avgProbability = withProbability.length > 0
      ? withProbability.reduce((sum, item) => sum + item.probability, 0) / withProbability.length
      : null;

    return {
      avgDealSize,
      avgProbability,
      totalCount: opportunities.length,
    };
  }, [opportunities]);

  const loadOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SalesService.getOpportunities(500, 0);
      setOpportunities((data || []) as Opportunity[]);
    } catch {
      showToast('error', 'Unable to load opportunities right now.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void loadOpportunities();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [loadOpportunities]);

  useEffect(() => {
    const handleImported = () => {
      void loadOpportunities();
    };

    window.addEventListener('sales-data-imported', handleImported);
    return () => {
      window.removeEventListener('sales-data-imported', handleImported);
    };
  }, [loadOpportunities]);

  async function openPipelineView() {
    setLoadingAction('pipeline-view');
    const totalDeals = opportunities.length;
    const message = `Pipeline loaded with ${totalDeals} active opportunities.`;
    showToast('success', message);
    await logActionEvent({ area: 'opportunities', action: 'pipeline_view', status: 'success', detail: message });
    setLoadingAction(null);
  }

  async function refreshOpportunities() {
    setLoadingAction('refresh');
    await loadOpportunities();
    await logActionEvent({ area: 'opportunities', action: 'refresh_data', status: 'success', detail: 'Opportunities refreshed.' });
    setLoadingAction(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Opportunities"
        description="Upload opportunity data and automatically visualize stages and confidence where available."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={openPipelineView} isLoading={loadingAction === 'pipeline-view'}>Pipeline View</Button>
            <Button size="sm" onClick={refreshOpportunities} isLoading={loadingAction === 'refresh'}>Refresh</Button>
          </>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {isLoading ? (
            <>
              <SkeletonKanban columns={3} cardsPerColumn={2} />
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonTable columns={6} rows={6} />
                </CardContent>
              </Card>
            </>
          ) : null}
          {!isLoading && stageGroups.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-slate-400">No data to represent here yet. Upload opportunity CSV/JSON first.</p>
              </CardContent>
            </Card>
          ) : null}
          {!isLoading && stageGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stageGroups.map((column) => (
                <Card key={column.stage}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{column.stage.replace('_', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.deals.map((deal) => (
                      <div key={deal.id} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3">
                        <p className="text-sm font-medium text-slate-100">{deal.name || 'No data'}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount data'}
                        </p>
                        <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                            style={{ width: `${Math.max(0, Math.min(100, deal.probability || 0))}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          {deal.probability != null ? `Confidence ${Math.round(deal.probability)}%` : 'No confidence data'}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {!isLoading && opportunities.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Stage</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Probability</th>
                        <th className="pb-3">Close Date</th>
                        <th className="pb-3">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.map((opportunity) => (
                        <tr key={opportunity.id} className="border-t border-slate-700/40 text-slate-200">
                          <td className="py-3 font-medium">{opportunity.name || 'No data'}</td>
                          <td className="py-3 capitalize">{(opportunity.stage || 'No data').replace('_', ' ')}</td>
                          <td className="py-3">{opportunity.amount ? `$${opportunity.amount.toLocaleString()}` : 'No data'}</td>
                          <td className="py-3">{opportunity.probability != null ? `${Math.round(opportunity.probability)}%` : 'No data'}</td>
                          <td className="py-3">{opportunity.close_date ? new Date(opportunity.close_date).toLocaleDateString() : 'No data'}</td>
                          <td className="py-3">{opportunity.assigned_to || 'No data'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Use the Global Upload CSV button (bottom-right) for automatic routing and import.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {isLoading ? (
                <SkeletonText lines={4} />
              ) : (
                <>
                  <p>Total opportunities: {analytics.totalCount}</p>
                  <p>
                    Average amount:{' '}
                    {analytics.avgDealSize != null ? `$${Math.round(analytics.avgDealSize).toLocaleString()}` : 'No data to represent here'}
                  </p>
                  <p>
                    Average confidence:{' '}
                    {analytics.avgProbability != null ? `${Math.round(analytics.avgProbability)}%` : 'No data to represent here'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
