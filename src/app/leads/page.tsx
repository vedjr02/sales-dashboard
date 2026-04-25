'use client';

import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const leadSources = [
  { source: 'Organic', volume: 94, winRate: 28 },
  { source: 'Paid Search', volume: 62, winRate: 21 },
  { source: 'Referral', volume: 41, winRate: 36 },
  { source: 'Outbound', volume: 57, winRate: 18 },
];

const leads = [
  { name: 'Aria Watson', company: 'Novalytics', stage: 'Qualified', score: 91, owner: 'Ethan', next: 'Demo prep' },
  { name: 'Luis Mendez', company: 'ScaleMint', stage: 'Contacted', score: 77, owner: 'Noah', next: 'Discovery call' },
  { name: 'Hina Patel', company: 'FleetIQ', stage: 'Proposal', score: 88, owner: 'Ava', next: 'Pricing review' },
  { name: 'Kai Morgan', company: 'Parcel Grid', stage: 'Nurture', score: 64, owner: 'Mila', next: 'Email sequence' },
  { name: 'Sofia Russo', company: 'Clearmesh', stage: 'Qualified', score: 84, owner: 'Zane', next: 'Security review' },
];

const playbooks = [
  'Intent spike trigger: route to SDR in < 10 min',
  'Lead score > 85: auto-book strategy call',
  'Dormant for 7 days: send nurture sequence v3',
];

export default function LeadsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Leads"
        description="Capture, qualify and route high-intent leads with AI scoring and workflow automation."
        actions={
          <>
            <Button variant="outline" size="sm">Import CSV</Button>
            <Button size="sm">Create Lead</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {leadSources.map((item) => (
                <div key={item.source} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-4">
                  <p className="text-sm text-slate-400">{item.source}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">{item.volume}</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${item.winRate * 2.2}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Win rate {item.winRate}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Playbooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {playbooks.map((rule) => (
              <div key={rule} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3 text-sm text-slate-300">
                {rule}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">Manage Playbooks</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lead Workbench</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3">Lead</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Next Step</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.name} className="border-t border-slate-700/40 text-slate-200">
                    <td className="py-3">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.company}</p>
                    </td>
                    <td className="py-3">{lead.stage}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-200">{lead.score}</span>
                    </td>
                    <td className="py-3">{lead.owner}</td>
                    <td className="py-3 text-slate-300">{lead.next}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="ghost">Open</Button>
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
