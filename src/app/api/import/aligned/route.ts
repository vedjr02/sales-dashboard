import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

interface AlignedImportRequestBody {
  leads?: Array<Record<string, unknown>>;
  opportunities?: Array<Record<string, unknown>>;
  deals?: Array<Record<string, unknown>>;
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

    if (leads.length > 0) {
      const { error } = await supabase.from('leads').insert(leads);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message, entity: 'leads' }, { status: 500 });
      }
    }

    if (opportunities.length > 0) {
      const { error } = await supabase.from('opportunities').insert(opportunities);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message, entity: 'opportunities' }, { status: 500 });
      }
    }

    if (deals.length > 0) {
      const { error } = await supabase.from('deals').insert(deals);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message, entity: 'deals' }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        leads: { imported: leads.length },
        opportunities: { imported: opportunities.length },
        deals: { imported: deals.length },
      },
      importedTotal: totalRows,
      message: 'Aligned data imported successfully.',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected aligned import error.' }, { status: 500 });
  }
}
