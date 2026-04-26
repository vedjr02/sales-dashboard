import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { bucketRowsByEntity, mapImportRow } from '@/lib/dataImport';

interface GlobalImportRequestBody {
  rows?: Array<Record<string, string>>;
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
        { ok: false, error: 'Supabase admin configuration is missing.' },
        { status: 500 }
      );
    }

    const buckets = bucketRowsByEntity(rows);
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

      importSummary[entityInfo.key].imported = normalizedRows.length;
      importSummary[entityInfo.key].skipped = entityInfo.rows.length - normalizedRows.length;

      if (normalizedRows.length === 0) {
        continue;
      }

      const { error } = await supabase.from(entityInfo.key).insert(normalizedRows);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message, entity: entityInfo.key }, { status: 500 });
      }
    }

    const importedTotal =
      importSummary.leads.imported + importSummary.opportunities.imported + importSummary.deals.imported;

    return NextResponse.json({
      ok: true,
      summary: importSummary,
      importedTotal,
      processedRows: rows.length,
      message: 'Global import completed.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected import error.' }, { status: 500 });
  }
}