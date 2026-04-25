'use client';

import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const columns = [
  {
    stage: 'Qualification',
    deals: [
      { name: 'Tera Logistics', value: '$42K', confidence: 62 },
      { name: 'Nexa Retail', value: '$18K', confidence: 54 },
    ],
  },
  {
    stage: 'Proposal',
    deals: [
      { name: 'Vertex Labs', value: '$95K', confidence: 78 },
      { name: 'Clearbit Data', value: '$24K', confidence: 73 },
    ],
  },
  {
    stage: 'Negotiation',
    deals: [
      { name: 'Solaro Finance', value: '$61K', confidence: 84 },
      { name: 'Cloudwise', value: '$38K', confidence: 69 },
    ],
  },
  {
    stage: 'Commit',
    deals: [
      { name: 'Infrakit', value: '$73K', confidence: 92 },
    ],
  },
];

const aiSuggestions = [
  'Bundle onboarding credit for Solaro Finance to close this week.',
  'Bring security architect into Vertex Labs proposal to unblock legal.',
  'Escalate NPS case study to Tera Logistics buying committee.',
];

export default function OpportunitiesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Opportunities"
        description="Visual pipeline with confidence signals, deal velocity and AI close recommendations."
        actions={
          <>
            <Button variant="outline" size="sm">Pipeline View</Button>
            <Button size="sm">New Opportunity</Button>
          </>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => (
            <Card key={column.stage}>
              <CardHeader>
                <CardTitle className="text-base">{column.stage}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.deals.map((deal) => (
                  <div key={deal.name} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3">
                    <p className="text-sm font-medium text-slate-100">{deal.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{deal.value}</p>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                        style={{ width: `${deal.confidence}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Confidence {deal.confidence}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Deal Coach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiSuggestions.map((tip) => (
              <div key={tip} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3 text-sm text-slate-300">
                {tip}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">Generate Account Plan</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
