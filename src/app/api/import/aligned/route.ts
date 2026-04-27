import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

interface AlignedImportRequestBody {
  leads?: Array<Record<string, unknown>>;
  opportunities?: Array<Record<string, unknown>>;
  deals?: Array<Record<string, unknown>>;
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
    const body = (await request.json()) as AlignedImportRequestBody;
    const leads = Array.isArray(body.leads) ? body.leads : [];
    const opportunities = Array.isArray(body.opportunities) ? body.opportunities : [];
    const deals = Array.isArray(body.deals) ? body.deals : [];

    const totalRows = leads.length + opportunities.length + deals.length;
    if (totalRows === 0) {
      return NextResponse.json({ ok: false, error: 'No aligned rows were provided for import.' }, { status: 400 });
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

    const warnings: string[] = [];
    let importedLeads = 0;
    let importedOpportunities = 0;
    let importedDeals = 0;

    if (leads.length > 0) {
      const { error } = await supabase.from('leads').insert(leads);
      if (error) {
        if (isMissingTableError(error, 'leads')) {
          warnings.push('Leads table is missing in Supabase. Leads rows were skipped.');
        } else {
          return NextResponse.json({ ok: false, error: error.message, entity: 'leads' }, { status: 500 });
        }
      } else {
        importedLeads = leads.length;
      }
    }

    if (opportunities.length > 0) {
      const { error } = await supabase.from('opportunities').insert(opportunities);
      if (error) {
        if (isMissingTableError(error, 'opportunities')) {
          warnings.push('Opportunities table is missing in Supabase. Opportunities rows were skipped.');
        } else {
          return NextResponse.json({ ok: false, error: error.message, entity: 'opportunities' }, { status: 500 });
        }
      } else {
        importedOpportunities = opportunities.length;
      }
    }

    if (deals.length > 0) {
      const { error } = await supabase.from('deals').insert(deals);
      if (error) {
        if (isMissingTableError(error, 'deals')) {
          warnings.push('Deals table is missing in Supabase. Deals rows were skipped.');
        } else {
          return NextResponse.json({ ok: false, error: error.message, entity: 'deals' }, { status: 500 });
        }
      } else {
        importedDeals = deals.length;
      }
    }

    const importedTotal = importedLeads + importedOpportunities + importedDeals;

    return NextResponse.json({
      ok: true,
      summary: {
        leads: { imported: importedLeads },
        opportunities: { imported: importedOpportunities },
        deals: { imported: importedDeals },
      },
      importedTotal,
      warnings,
      message:
        warnings.length > 0
          ? 'Aligned data imported partially. Some entities were skipped because their table is missing in Supabase.'
          : 'Aligned data imported successfully.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected aligned import error.' }, { status: 500 });
  }
}
