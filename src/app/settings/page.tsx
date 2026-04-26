'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { logActionEvent } from '@/services/actionEvents';

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

const DEFAULT_NOTIFICATIONS = Object.fromEntries(
  NOTIFICATION_LABELS.map((label) => [label, true])
) as Record<string, boolean>;

interface SettingsSnapshot {
  workspaceName: string;
  timezone: string;
  currency: string;
  notifications: Record<string, boolean>;
  integrations: IntegrationItem[];
  loadError?: boolean;
}

function getInitialSettings(): SettingsSnapshot {
  const defaults: SettingsSnapshot = {
    workspaceName: 'SalesDash Revenue Ops',
    timezone: 'Europe/Dublin',
    currency: 'USD',
    notifications: DEFAULT_NOTIFICATIONS,
    integrations: DEFAULT_INTEGRATIONS,
  };

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SettingsSnapshot>;
    return {
      workspaceName: parsed.workspaceName || defaults.workspaceName,
      timezone: parsed.timezone || defaults.timezone,
      currency: parsed.currency || defaults.currency,
      notifications: parsed.notifications || defaults.notifications,
      integrations: parsed.integrations || defaults.integrations,
    };
  } catch {
    return { ...defaults, loadError: true };
  }
}

export default function SettingsPage() {
  const [initialSettings] = useState<SettingsSnapshot>(() => getInitialSettings());
  const [workspaceName, setWorkspaceName] = useState(initialSettings.workspaceName);
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(initialSettings.notifications);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialSettings.integrations);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  const dirty = useMemo(() => {
    const hasNotificationChanges = JSON.stringify(notifications) !== JSON.stringify(DEFAULT_NOTIFICATIONS);
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
    if (initialSettings.loadError) {
      showToast('error', 'Could not load saved settings. Using defaults.');
    }
  }, [initialSettings.loadError, showToast]);

  async function handleSaveChanges() {
    setLoadingAction('save-settings');
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
      const message = 'Settings saved successfully.';
      showToast('success', message);
      await logActionEvent({ area: 'settings', action: 'save_changes', status: 'success', detail: message });
    } catch {
      const message = 'Unable to save settings. Please try again.';
      showToast('error', message);
      await logActionEvent({ area: 'settings', action: 'save_changes', status: 'error', detail: message });
    } finally {
      setLoadingAction(null);
    }
  }

  function handleNotificationChange(label: string, checked: boolean) {
    setNotifications((prev) => ({ ...prev, [label]: checked }));
  }

  async function handleIntegrationManage(app: string) {
    setLoadingAction(`integration-${app}`);
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
    const message = `${app} integration updated.`;
    showToast('success', message);
    await logActionEvent({ area: 'settings', action: 'manage_integration', status: 'success', detail: message });
    setLoadingAction(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Control workspace preferences, notifications and connected systems."
        actions={<Button size="sm" onClick={handleSaveChanges} isLoading={loadingAction === 'save-settings'}>{dirty ? 'Save Changes *' : 'Save Changes'}</Button>}
      />

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
                isLoading={loadingAction === `integration-${integration.app}`}
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
