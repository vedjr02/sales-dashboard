'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastProvider';
import { ImportEntity, parseDatasetFile } from '@/lib/dataImport';

interface DataImportPanelProps {
  entity: ImportEntity;
  onImportComplete: () => Promise<void> | void;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  message: string;
}

function entityLabel(entity: ImportEntity) {
  if (entity === 'leads') return 'Leads';
  if (entity === 'opportunities') return 'Opportunities';
  return 'Deals';
}

export function DataImportPanel({ entity, onImportComplete }: DataImportPanelProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    setSummary(null);

    try {
      const parsed = await parseDatasetFile(file);

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity,
          rows: parsed.rows,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        imported?: number;
        skipped?: number;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Import failed.');
      }

      const imported = result.imported ?? 0;
      const skipped = result.skipped ?? 0;
      const message = result.message || 'Import completed.';

      setSummary({ imported, skipped, message });
      showToast('success', `${entityLabel(entity)} import finished. Imported ${imported}.`);
      await onImportComplete();
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
    <Card>
      <CardHeader>
        <CardTitle>Import {entityLabel(entity)} Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-300">
          Upload CSV, JSON, or Excel files. Supported fields are auto-mapped and missing aspects are left empty.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls,text/csv,application/json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileSelected}
          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400/90 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-900 hover:file:bg-cyan-300"
          disabled={isImporting}
        />
        {summary ? (
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3 text-sm text-cyan-100">
            <p>{summary.message}</p>
            <p>Imported: {summary.imported}</p>
            <p>Skipped: {summary.skipped}</p>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            isLoading={isImporting}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Choose File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}