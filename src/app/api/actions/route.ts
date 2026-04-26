import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ActionEventPayload {
  area: string;
  action: string;
  status: 'success' | 'error';
  detail?: string;
}

function isValidPayload(payload: unknown): payload is ActionEventPayload {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as Partial<ActionEventPayload>;
  return (
    typeof candidate.area === 'string' &&
    typeof candidate.action === 'string' &&
    (candidate.status === 'success' || candidate.status === 'error') &&
    (typeof candidate.detail === 'string' || typeof candidate.detail === 'undefined')
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    if (!isValidPayload(payload)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: true, persisted: false });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from('action_events').insert([
      {
        area: payload.area,
        action: payload.action,
        status: payload.status,
        detail: payload.detail ?? null,
      },
    ]);

    if (error) {
      return NextResponse.json({ ok: true, persisted: false, reason: error.message });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected error.' }, { status: 500 });
  }
}
