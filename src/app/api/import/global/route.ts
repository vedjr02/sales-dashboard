import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { bucketRowsByEntity, mapImportRow } from '@/lib/dataImport';

interface GlobalImportRequestBody {
  rows?: Array<Record<string, string>>;
}

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
    const body = (await request.json()) as GlobalImportRequestBody;
    const rows = body.rows;

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

    const buckets = bucketRowsByEntity(rows);
    const warnings: string[] = [];
    const importSummary = {
      leads: { imported: 0, skipped: 0 },
      opportunities: { imported: 0, skipped: 0 },
      deals: { imported: 0, skipped: 0 },
      unknown: buckets.unknown.length,
    };

    const entities = [
      { key: 'leads', rows: buckets.leads },
      { key: 'opportunities', rows: buckets.opportunities },
      { key: 'deals', rows: buckets.deals },
    ] as const;

    for (const entityInfo of entities) {
      if (entityInfo.rows.length === 0) {
        continue;
      }

      const normalizedRows = entityInfo.rows
        .map((row) => mapImportRow(entityInfo.key, row))
        .filter((row) => row !== null);
      const mappedButNotInserted = entityInfo.rows.length - normalizedRows.length;
      importSummary[entityInfo.key].skipped = mappedButNotInserted;

      if (normalizedRows.length === 0) {
        continue;
      }

      const { error } = await supabase.from(entityInfo.key).insert(normalizedRows);
      if (error) {
        if (isMissingTableError(error, entityInfo.key)) {
          warnings.push(`${entityInfo.key} table is missing in Supabase. ${normalizedRows.length} rows were skipped.`);
          importSummary[entityInfo.key].skipped += normalizedRows.length;
          continue;
        }

        return NextResponse.json({ ok: false, error: error.message, entity: entityInfo.key }, { status: 500 });
      }

      importSummary[entityInfo.key].imported = normalizedRows.length;
    }

    const importedTotal =
      importSummary.leads.imported + importSummary.opportunities.imported + importSummary.deals.imported;

    return NextResponse.json({
      ok: true,
      summary: importSummary,
      importedTotal,
      processedRows: rows.length,
      warnings,
      message:
        warnings.length > 0
          ? 'Global import completed partially. Some entities were skipped because their table is missing in Supabase.'
          : 'Global import completed.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected import error.' }, { status: 500 });
  }
}