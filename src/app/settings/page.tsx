'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type IntegrationStatus = 'Connected' | 'Disconnected' | 'Needs Attention';

interface IntegrationItem {
  app: string;
  status: IntegrationStatus;
}

const NOTIFICATION_LABELS = [
  'Daily pipeline digest',
  'High-risk deal alerts',
  'Rep coaching recommendations',
  'Weekly board summary',
];

const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { app: 'HubSpot', status: 'Connected' },
  { app: 'Slack', status: 'Connected' },
  { app: 'Stripe', status: 'Needs Attention' },
];

const SETTINGS_KEY = 'salesdash.settings.v1';

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('SalesDash Revenue Ops');
  const [timezone, setTimezone] = useState('Europe/Dublin');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_LABELS.map((label) => [label, true]))
  );
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(DEFAULT_INTEGRATIONS);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const dirty = useMemo(() => {
    const defaultNotifications = Object.fromEntries(NOTIFICATION_LABELS.map((label) => [label, true]));
    const hasNotificationChanges = JSON.stringify(notifications) !== JSON.stringify(defaultNotifications);
    const hasIntegrationChanges = JSON.stringify(integrations) !== JSON.stringify(DEFAULT_INTEGRATIONS);
    return (
      workspaceName !== 'SalesDash Revenue Ops' ||
      timezone !== 'Europe/Dublin' ||
      currency !== 'USD' ||
      hasNotificationChanges ||
      hasIntegrationChanges
    );
  }, [workspaceName, timezone, currency, notifications, integrations]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        workspaceName: string;
        timezone: string;
        currency: string;
        notifications: Record<string, boolean>;
        integrations: IntegrationItem[];
      };
      setWorkspaceName(parsed.workspaceName || 'SalesDash Revenue Ops');
      setTimezone(parsed.timezone || 'Europe/Dublin');
      setCurrency(parsed.currency || 'USD');
      setNotifications(parsed.notifications || Object.fromEntries(NOTIFICATION_LABELS.map((label) => [label, true])));
      setIntegrations(parsed.integrations || DEFAULT_INTEGRATIONS);
    } catch {
      setStatusMessage({ type: 'error', message: 'Could not load saved settings. Using defaults.' });
      window.setTimeout(() => setStatusMessage(null), 2500);
    }
  }, []);

  function showStatus(type: 'success' | 'error', message: string) {
    setStatusMessage({ type, message });
    window.setTimeout(() => setStatusMessage(null), 2500);
  }

  function handleSaveChanges() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          workspaceName,
          timezone,
          currency,
          notifications,
          integrations,
        })
      );
      showStatus('success', 'Settings saved successfully.');
    } catch {
      showStatus('error', 'Unable to save settings. Please try again.');
    }
  }

  function handleNotificationChange(label: string, checked: boolean) {
    setNotifications((prev) => ({ ...prev, [label]: checked }));
  }

  function handleIntegrationManage(app: string) {
    setIntegrations((prev) =>
      prev.map((integration) => {
        if (integration.app !== app) return integration;
        if (integration.status === 'Connected') {
          return { ...integration, status: 'Needs Attention' };
        }
        if (integration.status === 'Needs Attention') {
          return { ...integration, status: 'Disconnected' };
        }
        return { ...integration, status: 'Connected' };
      })
    );
    showStatus('success', `${app} integration updated.`);
  }

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Control workspace preferences, notifications and connected systems."
        actions={<Button size="sm" onClick={handleSaveChanges}>{dirty ? 'Save Changes *' : 'Save Changes'}</Button>}
      />

      {statusMessage ? (
        <div
          className={`mb-6 rounded-xl border px-3 py-2 text-sm ${
            statusMessage.type === 'success'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-400/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {statusMessage.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-slate-400">Workspace Name</label>
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-400">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/70"
              >
                <option>Europe/Dublin</option>
                <option>America/New_York</option>
                <option>Asia/Dubai</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-400">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/70"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            {NOTIFICATION_LABELS.map((label) => (
              <label key={label} className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/35 px-3 py-2">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(notifications[label])}
                  onChange={(e) => handleNotificationChange(label, e.target.checked)}
                  className="h-4 w-4 accent-cyan-300"
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {integrations.map((integration) => (
            <div key={integration.app} className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-4">
              <p className="font-medium text-slate-100">{integration.app}</p>
              <p className="mt-1 text-xs text-slate-400">{integration.status}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleIntegrationManage(integration.app)}
              >
                Manage
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
