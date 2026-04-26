'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';
import { SalesService } from '@/services/sales';
import { Lead } from '@/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const sourceSummary = useMemo(() => {
    const counters = leads.reduce<Record<string, number>>((acc, lead) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counters)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const statusSummary = useMemo(() => {
    const counters = leads.reduce<Record<string, number>>((acc, lead) => {
      const status = lead.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counters)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const loadLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SalesService.getLeads(500, 0);
      setLeads((data || []) as Lead[]);
    } catch {
      showToast('error', 'Unable to load leads right now.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void loadLeads();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [loadLeads]);

  useEffect(() => {
    const handleImported = () => {
      void loadLeads();
    };

    window.addEventListener('sales-data-imported', handleImported);
    return () => {
      window.removeEventListener('sales-data-imported', handleImported);
    };
  }, [loadLeads]);

  async function downloadTemplate() {
    setLoadingAction('download-template');
    const csv = [
      'name,email,phone,company,status,source,assigned_to',
      'Jane Roe,jane@northwind.com,+1-555-1000,Northwind,qualified,referral,Alex',
    ].join('\n');
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lead-import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const message = 'CSV template downloaded.';
      showToast('success', message);
      await logActionEvent({ area: 'leads', action: 'import_csv_template', status: 'success', detail: message });
    } catch {
      const message = 'Could not download CSV template.';
      showToast('error', message);
      await logActionEvent({ area: 'leads', action: 'import_csv_template', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  async function refreshLeads() {
    setLoadingAction('refresh');
    await loadLeads();
    await logActionEvent({ area: 'leads', action: 'refresh_data', status: 'success', detail: 'Leads refreshed.' });
    setLoadingAction(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        description="Upload your lead data and instantly visualize whatever fields are available."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={downloadTemplate} isLoading={loadingAction === 'download-template'}>Template</Button>
            <Button size="sm" onClick={refreshLeads} isLoading={loadingAction === 'refresh'}>Refresh</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceSummary.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {sourceSummary.map((item) => (
                  <div key={item.source} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-4">
                    <p className="text-sm capitalize text-slate-400">{item.source.replace('_', ' ')}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{item.count}</p>
                    <p className="mt-2 text-xs text-slate-400">Leads from this source</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data to represent here for lead source analytics yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              Use the Global Upload CSV button (bottom-right) to import one file and auto-map rows.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lead Workbench</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-slate-400">Loading lead data...</p> : null}
          {!isLoading && leads.length === 0 ? (
            <p className="text-sm text-slate-400">No data to represent here yet. Upload lead CSV/JSON to populate this view.</p>
          ) : null}
          {!isLoading && leads.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {statusSummary.length > 0 ? statusSummary.map((entry) => (
                  <span key={entry.status} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs capitalize text-cyan-100">
                    {entry.status.replace('_', ' ')}: {entry.count}
                  </span>
                )) : <span className="text-xs text-slate-400">No status data to represent here.</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Company</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Source</th>
                      <th className="pb-3">Owner</th>
                      <th className="pb-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-t border-slate-700/40 text-slate-200">
                        <td className="py-3 font-medium">{lead.name || 'No data'}</td>
                        <td className="py-3">{lead.company || 'No data'}</td>
                        <td className="py-3">{lead.email || 'No data'}</td>
                        <td className="py-3 capitalize">{(lead.status || 'No data').replace('_', ' ')}</td>
                        <td className="py-3 capitalize">{(lead.source || 'No data').replace('_', ' ')}</td>
                        <td className="py-3">{lead.assigned_to || 'No data'}</td>
                        <td className="py-3">{lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'No data'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
