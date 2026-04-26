export interface ActionEventPayload {
  area: string;
  action: string;
  status: 'success' | 'error';
  detail?: string;
}

export async function logActionEvent(payload: ActionEventPayload) {
  try {
    await fetch('/api/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Do not block UI interactions on telemetry failure.
  }
}
