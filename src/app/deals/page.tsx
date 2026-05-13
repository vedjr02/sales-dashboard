'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCardRows, SkeletonPipelineRows, SkeletonTable } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';
import { SalesService } from '@/services/sales';
import { Deal } from '@/types';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const forecast = useMemo(() => {
    const byMonth = deals.reduce<Record<string, number>>((acc, deal) => {
      if (!deal.close_date || !Number.isFinite(deal.value)) {
        return acc;
      }
      const date = new Date(deal.close_date);
      if (Number.isNaN(date.getTime())) {
        return acc;
      }
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + deal.value;
      return acc;
    }, {});

    return Object.entries(byMonth)
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [deals]);

  const loadDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SalesService.getDeals(500, 0);
      setDeals((data || []) as Deal[]);
    } catch {
      showToast('error', 'Unable to load deals right now.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void loadDeals();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [loadDeals]);

  useEffect(() => {
    const handleImported = () => {
      void loadDeals();
    };

    window.addEventListener('sales-data-imported', handleImported);
    return () => {
      window.removeEventListener('sales-data-imported', handleImported);
    };
  }, [loadDeals]);

  async function openDealRoom() {
    setLoadingAction('open-deal-room');
    const message = `Deal room opened with ${deals.length} deals.`;
    showToast('success', message);
    await logActionEvent({ area: 'deals', action: 'open_deal_room', status: 'success', detail: message });
    setLoadingAction(null);
  }

  async function refreshDeals() {
    setLoadingAction('refresh');
    await loadDeals();
    await logActionEvent({ area: 'deals', action: 'refresh_data', status: 'success', detail: 'Deals refreshed.' });
    setLoadingAction(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Deals"
        description="Upload deal data and monitor forecasts, status, and closing timelines automatically."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={openDealRoom} isLoading={loadingAction === 'open-deal-room'}>Open Deal Room</Button>
            <Button size="sm" onClick={refreshDeals} isLoading={loadingAction === 'refresh'}>Refresh</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Deal Desk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable columns={6} rows={7} />
            ) : null}
            {!isLoading && deals.length === 0 ? (
              <p className="text-sm text-slate-400">No data to represent here yet. Upload deal CSV/JSON first.</p>
            ) : null}
            {!isLoading && deals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3">Account</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Close Date</th>
                      <th className="pb-3">Team</th>
                      <th className="pb-3">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal.id} className="border-t border-slate-700/40 text-slate-200">
                        <td className="py-3 font-medium">{deal.name || 'No data'}</td>
                        <td className="py-3">{deal.value ? `$${deal.value.toLocaleString()}` : 'No data'}</td>
                        <td className="py-3 capitalize">{(deal.status || 'No data').replace('_', ' ')}</td>
                        <td className="py-3">{deal.close_date ? new Date(deal.close_date).toLocaleDateString() : 'No data'}</td>
                        <td className="py-3">{deal.team_id || 'No data'}</td>
                        <td className="py-3">{deal.created_by || 'No data'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Use the Global Upload CSV button (bottom-right) to auto-import all supported sales data.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quarter Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <SkeletonPipelineRows count={3} />
              ) : forecast.length > 0 ? forecast.map((item) => (
                <div key={item.month}>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>{item.month}</span>
                    <span>${Math.round(item.value).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${Math.min(100, Math.max(12, item.value / 1000))}%` }}
                    />
                  </div>
                </div>
              )) : <p className="text-sm text-slate-400">No data to represent here for forecast.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <SkeletonCardRows count={4} />
              ) : deals.length > 0 ? (
                Object.entries(
                  deals.reduce<Record<string, number>>((acc, deal) => {
                    const status = deal.status || 'unknown';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([status, count]) => (
                  <div key={status} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3 text-sm text-slate-300">
                    <span className="capitalize">{status.replace('_', ' ')}</span>: {count}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No data to represent here for deal status.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
