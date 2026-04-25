'use client';

import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const templates = [
  { name: 'Executive Revenue Pack', cadence: 'Weekly', audience: 'Leadership' },
  { name: 'Pipeline Risk Digest', cadence: 'Daily', audience: 'RevOps' },
  { name: 'Rep Performance Pulse', cadence: 'Monthly', audience: 'Sales Managers' },
  { name: 'Win/Loss Narrative', cadence: 'Bi-weekly', audience: 'Product + Sales' },
];

const exportsLog = [
  { report: 'Executive Revenue Pack', format: 'PDF', requestedBy: 'Mia', status: 'Delivered' },
  { report: 'Pipeline Risk Digest', format: 'CSV', requestedBy: 'Ethan', status: 'Processing' },
  { report: 'Rep Performance Pulse', format: 'PDF', requestedBy: 'Noah', status: 'Delivered' },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="Automated reporting center with scheduling, exports and stakeholder delivery tracking."
        actions={
          <>
            <Button variant="outline" size="sm">Schedule</Button>
            <Button size="sm">Create Report</Button>
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
                <Button variant="ghost" size="sm" className="mt-4 w-full">Run Now</Button>
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
                {exportsLog.map((row) => (
                  <tr key={row.report + row.requestedBy} className="border-t border-slate-700/40 text-slate-200">
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
