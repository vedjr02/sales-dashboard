'use client';

import { useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';

const templates = [
  { name: 'Executive Revenue Pack', cadence: 'Weekly', audience: 'Leadership' },
  { name: 'Pipeline Risk Digest', cadence: 'Daily', audience: 'RevOps' },
  { name: 'Rep Performance Pulse', cadence: 'Monthly', audience: 'Sales Managers' },
  { name: 'Win/Loss Narrative', cadence: 'Bi-weekly', audience: 'Product + Sales' },
];

const INITIAL_EXPORTS_LOG = [
  { report: 'Executive Revenue Pack', format: 'PDF', requestedBy: 'Mia', status: 'Delivered' },
  { report: 'Pipeline Risk Digest', format: 'CSV', requestedBy: 'Ethan', status: 'Processing' },
  { report: 'Rep Performance Pulse', format: 'PDF', requestedBy: 'Noah', status: 'Delivered' },
];

export default function ReportsPage() {
  const [exportsLog, setExportsLog] = useState(INITIAL_EXPORTS_LOG);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  async function scheduleReport() {
    setLoadingAction('schedule-report');
    try {
      const content = [
        '# Report cadence (draft)',
        '',
        `- Created: ${new Date().toLocaleString()}`,
        '- Weekly: Executive Revenue Pack → Monday 08:00',
        '- Daily: Pipeline Risk Digest → Weekdays 07:30',
        '- Monthly: Rep Performance Pulse → 1st of month',
      ].join('\n');
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-cadence-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const message = 'Cadence template downloaded. Scheduler checklist opened.';
      showToast('success', message);
      await logActionEvent({ area: 'reports', action: 'schedule_report', status: 'success', detail: message });
    } catch {
      const message = 'Could not prepare scheduler template.';
      showToast('error', message);
      await logActionEvent({ area: 'reports', action: 'schedule_report', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  async function createReport() {
    setLoadingAction('create-report');
    setExportsLog((prev) => [
      {
        report: 'Custom Report',
        format: 'PDF',
        requestedBy: 'You',
        status: 'Processing',
      },
      ...prev,
    ]);
    const message = 'Custom report created and queued.';
    showToast('success', message);
    await logActionEvent({ area: 'reports', action: 'create_report', status: 'success', detail: message });
    setLoadingAction(null);
  }

  async function runTemplate(templateName: string) {
    setLoadingAction(`run-template-${templateName}`);
    setExportsLog((prev) => [
      {
        report: templateName,
        format: 'PDF',
        requestedBy: 'You',
        status: 'Processing',
      },
      ...prev,
    ]);
    const message = `${templateName} queued for export.`;
    showToast('success', message);
    await logActionEvent({ area: 'reports', action: 'run_template', status: 'success', detail: message });
    setLoadingAction(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="Automated reporting center with scheduling, exports and stakeholder delivery tracking."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={scheduleReport} isLoading={loadingAction === 'schedule-report'}>Schedule</Button>
            <Button size="sm" onClick={createReport} isLoading={loadingAction === 'create-report'}>Create Report</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {templates.map((template) => (
              <div key={template.name} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-4">
                <p className="font-medium text-slate-100">{template.name}</p>
                <p className="mt-2 text-xs text-slate-400">Cadence: {template.cadence}</p>
                <p className="text-xs text-slate-400">Audience: {template.audience}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => runTemplate(template.name)}
                  isLoading={loadingAction === `run-template-${template.name}`}
                >
                  Run Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3">Report</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3">Requested By</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {exportsLog.map((row, index) => (
                  <tr key={`${row.report}-${row.requestedBy}-${row.status}-${index}`} className="border-t border-slate-700/40 text-slate-200">
                    <td className="py-3">{row.report}</td>
                    <td className="py-3">{row.format}</td>
                    <td className="py-3">{row.requestedBy}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${row.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
