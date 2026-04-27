'use client';

import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { detectEntityForRow, mapImportRow, parseDatasetFile } from '@/lib/dataImport';

type AlignedRecord = Record<string, unknown>;

interface AlignedPayload {
  leads: AlignedRecord[];
  opportunities: AlignedRecord[];
  deals: AlignedRecord[];
}

interface AlignmentSummary {
  fileName: string;
  processed: number;
  aligned: number;
  unknown: number;
  skipped: number;
  leads: number;
  opportunities: number;
  deals: number;
}

interface PreviewRow {
  entity: 'lead' | 'opportunity' | 'deal';
  name?: unknown;
  value?: unknown;
  amount?: unknown;
  status?: unknown;
  stage?: unknown;
  close_date?: unknown;
  created_at?: unknown;
}

function buildAlignedPayload(rows: Array<Record<string, string>>) {
  const payload: AlignedPayload = {
    leads: [],
    opportunities: [],
    deals: [],
  };

  let unknown = 0;
  let skipped = 0;

  rows.forEach((row) => {
    const entity = detectEntityForRow(row);
    if (!entity) {
      unknown += 1;
      return;
    }

    const mapped = mapImportRow(entity, row);
    if (!mapped) {
      skipped += 1;
      return;
    }

    payload[entity].push(mapped as AlignedRecord);
  });

  return { payload, unknown, skipped };
}

export default function DataAlignerPage() {
  const [isAligning, setIsAligning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [autoUpload, setAutoUpload] = useState(true);
  const [summary, setSummary] = useState<AlignmentSummary | null>(null);
  const [alignedPayload, setAlignedPayload] = useState<AlignedPayload | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const previewRows = useMemo(() => {
    if (!alignedPayload) {
      return [] as PreviewRow[];
    }

    const previews: PreviewRow[] = [
      ...alignedPayload.leads.slice(0, 2).map((row) => ({ entity: 'lead', ...(row as Record<string, unknown>) } as PreviewRow)),
      ...alignedPayload.opportunities
        .slice(0, 2)
        .map((row) => ({ entity: 'opportunity', ...(row as Record<string, unknown>) } as PreviewRow)),
      ...alignedPayload.deals.slice(0, 2).map((row) => ({ entity: 'deal', ...(row as Record<string, unknown>) } as PreviewRow)),
    ];

    return previews;
  }, [alignedPayload]);

  async function uploadAlignedData(payload: AlignedPayload) {
    setIsUploading(true);
    try {
      const response = await fetch('/api/import/aligned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        importedTotal?: number;
        warnings?: string[];
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Aligned upload failed.');
      }

      window.dispatchEvent(new CustomEvent('sales-data-imported'));
      if (Array.isArray(result.warnings) && result.warnings.length > 0) {
        showToast('success', `Imported with warnings: ${result.warnings.join(' ')}`);
      }
      showToast('success', `Aligned upload complete. Imported ${result.importedTotal ?? 0} records.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload aligned data.';
      showToast('error', message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsAligning(true);
    try {
      const parsed = await parseDatasetFile(file);
      const { payload, unknown, skipped } = buildAlignedPayload(parsed.rows);
      const aligned = payload.leads.length + payload.opportunities.length + payload.deals.length;

      setAlignedPayload(payload);
      setSummary({
        fileName: file.name,
        processed: parsed.rows.length,
        aligned,
        unknown,
        skipped,
        leads: payload.leads.length,
        opportunities: payload.opportunities.length,
        deals: payload.deals.length,
      });

      showToast('success', `Aligned ${aligned} records from ${file.name}.`);

      if (autoUpload && aligned > 0) {
        await uploadAlignedData(payload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to align data file.';
      showToast('error', message);
      setAlignedPayload(null);
      setSummary(null);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setIsAligning(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Data Aligner"
        description="Upload any CSV, JSON, XLS, or XLSX file. We auto-align it to your dashboard schema, then upload it directly."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              isLoading={isAligning}
              disabled={isAligning || isUploading}
            >
              {isAligning ? 'Aligning...' : 'Choose File'}
            </Button>
            <Button
              size="sm"
              onClick={() => (alignedPayload ? void uploadAlignedData(alignedPayload) : undefined)}
              isLoading={isUploading}
              disabled={!alignedPayload || isUploading || isAligning}
            >
              Upload Aligned Data
            </Button>
          </>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,.xlsx,.xls,text/csv,application/json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>1. Upload your raw file from any source.</p>
            <p>2. We auto-detect leads, opportunities, and deals, then align the fields to your database shape.</p>
            <p>3. Aligned data uploads directly and dashboard views refresh.</p>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={autoUpload}
                onChange={(event) => setAutoUpload(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              Auto-upload right after alignment
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alignment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {!summary ? (
              <p className="text-sm text-slate-400">No file processed yet.</p>
            ) : (
              <div className="space-y-2 text-sm text-slate-200">
                <p className="text-slate-300">File: {summary.fileName}</p>
                <p>Processed rows: {summary.processed}</p>
                <p>Aligned rows: {summary.aligned}</p>
                <p>Leads: {summary.leads}</p>
                <p>Opportunities: {summary.opportunities}</p>
                <p>Deals: {summary.deals}</p>
                <p>Unknown rows: {summary.unknown}</p>
                <p>Skipped rows: {summary.skipped}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aligned Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewRows.length === 0 ? (
            <p className="text-sm text-slate-400">Upload a file to preview aligned records.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-200">
                <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-2 pr-4">Entity</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Value/Amount</th>
                    <th className="pb-2 pr-4">Status/Stage</th>
                    <th className="pb-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={`${String(row.entity)}-${index}`} className="border-t border-slate-700/40">
                      <td className="py-2 pr-4 capitalize">{String(row.entity ?? '-')}</td>
                      <td className="py-2 pr-4">{String(row.name ?? '-')}</td>
                      <td className="py-2 pr-4">{String(row.value ?? row.amount ?? '-')}</td>
                      <td className="py-2 pr-4">{String(row.status ?? row.stage ?? '-')}</td>
                      <td className="py-2 pr-4">{String(row.close_date ?? row.created_at ?? '-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
