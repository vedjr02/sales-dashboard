'use client';

import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const reps = [
  { name: 'Mia Carter', quota: '122%', meetings: 38, winRate: '42%' },
  { name: 'Noah Park', quota: '109%', meetings: 31, winRate: '37%' },
  { name: 'Ethan Ross', quota: '101%', meetings: 28, winRate: '34%' },
  { name: 'Lena Shaw', quota: '93%', meetings: 26, winRate: '30%' },
];

const coachingQueue = [
  'Lena: objection handling on procurement pushback',
  'Ethan: tighten discovery to reduce cycle time',
  'Noah: increase stage progression from proposal to negotiation',
];

export default function TeamPage() {
  return (
    <AppShell>
      <PageHeader
        title="Team"
        description="Performance cockpit for coaching, quota progress and execution health."
        actions={
          <>
            <Button variant="outline" size="sm">1:1 Planner</Button>
            <Button size="sm">Assign Goal</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3">Rep</th>
                    <th className="pb-3">Quota</th>
                    <th className="pb-3">Meetings</th>
                    <th className="pb-3">Win Rate</th>
                    <th className="pb-3">Momentum</th>
                  </tr>
                </thead>
                <tbody>
                  {reps.map((rep) => (
                    <tr key={rep.name} className="border-t border-slate-700/40 text-slate-200">
                      <td className="py-3 font-medium">{rep.name}</td>
                      <td className="py-3">{rep.quota}</td>
                      <td className="py-3">{rep.meetings}</td>
                      <td className="py-3">{rep.winRate}</td>
                      <td className="py-3 text-emerald-300">On Track</td>
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
              <CardTitle>Coaching Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coachingQueue.map((item) => (
                <div key={item} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">Open Coaching Plan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between rounded-xl bg-slate-900/35 px-3 py-2">
                <span>Capacity Utilization</span>
                <span>83%</span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-900/35 px-3 py-2">
                <span>Forecast Confidence</span>
                <span>High</span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-900/35 px-3 py-2">
                <span>At-Risk Accounts</span>
                <span>6</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
