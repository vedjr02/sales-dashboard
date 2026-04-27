'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { parseDatasetFile } from '@/lib/dataImport';

interface GlobalImportSummary {
  leads: { imported: number; skipped: number };
  opportunities: { imported: number; skipped: number };
  deals: { imported: number; skipped: number };
  unknown: number;
}

export function GlobalDataUploadButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { showToast } = useToast();

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const parsed = await parseDatasetFile(file);

      const response = await fetch('/api/import/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsed.rows }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        summary?: GlobalImportSummary;
        importedTotal?: number;
        warnings?: string[];
      };

      if (!response.ok || !result.ok || !result.summary) {
        throw new Error(result.error || 'Global import failed.');
      }

      window.dispatchEvent(new CustomEvent('sales-data-imported', { detail: result.summary }));

      if (Array.isArray(result.warnings) && result.warnings.length > 0) {
        showToast('success', `Imported with warnings: ${result.warnings.join(' ')}`);
      }

      showToast(
        'success',
        `Imported ${result.importedTotal ?? 0} rows. Leads ${result.summary.leads.imported}, Opportunities ${result.summary.opportunities.imported}, Deals ${result.summary.deals.imported}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import data.';
      showToast('error', message);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setIsImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,.xlsx,.xls,text/csv,application/json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="fixed bottom-5 right-5 z-50">
        <Button
          size="sm"
          onClick={() => inputRef.current?.click()}
          isLoading={isImporting}
          disabled={isImporting}
          className="shadow-[0_12px_28px_rgba(34,211,238,0.3)]"
        >
          {isImporting ? 'Processing Upload...' : 'Global Upload'}
        </Button>
      </div>

      {isImporting ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-[min(92vw,560px)] rounded-2xl px-6 py-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-300" />
            <h3 className="text-lg font-semibold text-slate-100">Importing and plotting your data</h3>
            <p className="mt-2 text-sm text-slate-300">
              We are auto-detecting leads, opportunities, and deals from your file.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}