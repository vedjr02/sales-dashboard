import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { ImportEntity, mapImportRow } from '@/lib/dataImport';

interface ImportRequestBody {
  entity?: ImportEntity;
  rows?: Array<Record<string, string>>;
}

const SUPPORTED_ENTITIES: ImportEntity[] = ['leads', 'opportunities', 'deals'];

function isMissingTableError(error: { code?: string; message?: string } | null, table: string) {
  if (!error) {
    return false;
  }

  const message = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes(`public.${table}`) ||
    message.includes(`relation \"${table}\" does not exist`) ||
    message.includes('schema cache')
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImportRequestBody;
    const entity = body.entity;
    const rows = body.rows;

    if (!entity || !SUPPORTED_ENTITIES.includes(entity)) {
      return NextResponse.json({ ok: false, error: 'Unsupported import entity.' }, { status: 400 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No rows were provided for import.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Supabase admin configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.',
        },
        { status: 500 }
      );
    }

    const normalizedRows = rows
      .map((row) => mapImportRow(entity, row))
      .filter((row) => row !== null);

    const skippedRows = rows.length - normalizedRows.length;
    if (normalizedRows.length === 0) {
      return NextResponse.json({
        ok: true,
        imported: 0,
        skipped: skippedRows,
        message: 'Rows were skipped because required fields were missing.',
      });
    }

    const { error } = await supabase.from(entity).insert(normalizedRows);
    if (error) {
      if (isMissingTableError(error, entity)) {
        return NextResponse.json({
          ok: true,
          imported: 0,
          skipped: rows.length,
          warnings: [`${entity} table is missing in Supabase. Rows were skipped.`],
          message: `${entity} table is missing in Supabase.`,
        });
      }

      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      imported: normalizedRows.length,
      skipped: skippedRows,
      message: 'Import completed successfully.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected import error.' }, { status: 500 });
  }
}