'use client';

import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const deals = [
  { name: 'Solaro Finance', owner: 'Mia', arr: '$61K', term: '24 mo', risk: 'Low', close: 'Apr 30' },
  { name: 'Vertex Labs', owner: 'Noah', arr: '$95K', term: '12 mo', risk: 'Medium', close: 'May 06' },
  { name: 'Tera Logistics', owner: 'Ethan', arr: '$42K', term: '18 mo', risk: 'High', close: 'May 12' },
  { name: 'Cloudwise', owner: 'Lena', arr: '$38K', term: '12 mo', risk: 'Medium', close: 'May 18' },
];

const approvals = [
  'Custom legal clause review for Vertex Labs',
  'Discount exception 17% for Tera Logistics',
  'Security rider sign-off for Solaro Finance',
];

export default function DealsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Deals"
        description="Operate your deal desk with approvals, risk flags and closing choreography."
        actions={
          <>
            <Button variant="outline" size="sm">Open Deal Room</Button>
            <Button size="sm">Create Quote</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Deal Desk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3">Account</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">ARR</th>
                    <th className="pb-3">Term</th>
                    <th className="pb-3">Risk</th>
                    <th className="pb-3">Close</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.name} className="border-t border-slate-700/40 text-slate-200">
                      <td className="py-3 font-medium">{deal.name}</td>
                      <td className="py-3">{deal.owner}</td>
                      <td className="py-3">{deal.arr}</td>
                      <td className="py-3">{deal.term}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            deal.risk === 'Low'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : deal.risk === 'Medium'
                                ? 'bg-amber-500/20 text-amber-200'
                                : 'bg-rose-500/20 text-rose-200'
                          }`}
                        >
                          {deal.risk}
                        </span>
                      </td>
                      <td className="py-3">{deal.close}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarter Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[72, 81, 65].map((value, idx) => (
                <div key={value}>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Month {idx + 1}</span>
                    <span>{value}% attainment</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvals.map((item) => (
                <div key={item} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">Review Queue</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
