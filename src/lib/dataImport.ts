export type ImportEntity = 'leads' | 'opportunities' | 'deals';

export interface ParsedDataset {
  rows: Array<Record<string, string>>;
  headers: string[];
}

export interface GlobalImportBuckets {
  leads: Array<Record<string, string>>;
  opportunities: Array<Record<string, string>>;
  deals: Array<Record<string, string>>;
  unknown: Array<Record<string, string>>;
}

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'lost', 'converted']);
const LEAD_SOURCES = new Set(['website', 'referral', 'cold_call', 'email', 'event', 'social']);
const OPPORTUNITY_STAGES = new Set([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);
const DEAL_STATUSES = new Set(['pipeline', 'negotiation', 'won', 'lost']);

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      currentRow.push(currentCell.trim());
      currentCell = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      currentRow.push(currentCell.trim());
      const hasContent = currentRow.some((value) => value.length > 0);
      if (hasContent) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    const hasContent = currentRow.some((value) => value.length > 0);
    if (hasContent) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseJsonRows(text: string): Record<string, unknown>[] {
  const raw = JSON.parse(text) as unknown;
  if (!Array.isArray(raw)) {
    throw new Error('JSON import must be an array of objects.');
  }

  const objectRows = raw.filter((entry): entry is Record<string, unknown> => {
    return typeof entry === 'object' && entry !== null && !Array.isArray(entry);
  });

  return objectRows;
}

export function parseDatasetText(rawText: string, fileName: string): ParsedDataset {
  const text = rawText.trim();
  if (!text) {
    throw new Error('The uploaded file is empty.');
  }

  const isJson = fileName.toLowerCase().endsWith('.json') || text.startsWith('[');
  if (isJson) {
    const jsonRows = parseJsonRows(text);
    const headersSet = new Set<string>();
    jsonRows.forEach((row) => {
      Object.keys(row).forEach((key) => headersSet.add(normalizeKey(key)));
    });

    const headers = [...headersSet];
    const rows = jsonRows.map((row) => {
      const normalized: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeKey(key)] = value == null ? '' : String(value).trim();
      });
      return normalized;
    });

    return { rows, headers };
  }

  const csvRows = parseCsvRows(text);
  if (csvRows.length < 2) {
    throw new Error('CSV file must include a header row and at least one data row.');
  }

  const headers = csvRows[0].map((header) => normalizeKey(header));
  const rows = csvRows.slice(1).map((row) => {
    const normalized: Record<string, string> = {};
    headers.forEach((header, idx) => {
      normalized[header] = (row[idx] ?? '').trim();
    });
    return normalized;
  });

  return { rows, headers };
}

function pickValue(record: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = record[alias];
    if (value != null && value !== '') {
      return value;
    }
  }
  return '';
}

function scoreRowForLeads(row: Record<string, string>) {
  let score = 0;
  if (pickValue(row, ['name', 'full_name', 'lead_name', 'contact_name'])) score += 2;
  if (pickValue(row, ['email', 'email_address'])) score += 1;
  if (pickValue(row, ['company', 'organization', 'account'])) score += 2;
  if (pickValue(row, ['source', 'lead_source', 'channel'])) score += 2;
  if (pickValue(row, ['phone', 'phone_number', 'mobile'])) score += 1;
  return score;
}

function scoreRowForOpportunities(row: Record<string, string>) {
  let score = 0;
  if (pickValue(row, ['name', 'opportunity_name', 'deal_name'])) score += 2;
  if (pickValue(row, ['amount', 'arr'])) score += 2;
  if (pickValue(row, ['probability', 'confidence'])) score += 2;
  if (pickValue(row, ['lead_id', 'lead_reference'])) score += 2;
  if (pickValue(row, ['stage', 'opportunity_stage'])) score += 1;
  return score;
}

function scoreRowForDeals(row: Record<string, string>) {
  let score = 0;
  if (pickValue(row, ['name', 'deal_name', 'account_name'])) score += 2;
  if (pickValue(row, ['value', 'amount', 'arr'])) score += 2;
  if (pickValue(row, ['team_id', 'team'])) score += 2;
  if (pickValue(row, ['created_by', 'sales_rep', 'owner'])) score += 2;
  if (pickValue(row, ['status', 'deal_status'])) score += 1;
  return score;
}

export function detectEntityForRow(row: Record<string, string>): ImportEntity | null {
  const leadScore = scoreRowForLeads(row);
  const opportunityScore = scoreRowForOpportunities(row);
  const dealScore = scoreRowForDeals(row);

  const bestScore = Math.max(leadScore, opportunityScore, dealScore);
  if (bestScore < 3) {
    return null;
  }

  if (opportunityScore === bestScore && opportunityScore > dealScore) {
    return 'opportunities';
  }
  if (dealScore === bestScore && dealScore > opportunityScore) {
    return 'deals';
  }
  if (leadScore === bestScore && leadScore > dealScore && leadScore > opportunityScore) {
    return 'leads';
  }

  if (pickValue(row, ['probability', 'confidence', 'lead_id', 'lead_reference'])) {
    return 'opportunities';
  }
  if (pickValue(row, ['team_id', 'team', 'created_by', 'sales_rep'])) {
    return 'deals';
  }
  return 'leads';
}

export function bucketRowsByEntity(rows: Array<Record<string, string>>): GlobalImportBuckets {
  const buckets: GlobalImportBuckets = {
    leads: [],
    opportunities: [],
    deals: [],
    unknown: [],
  };

  rows.forEach((row) => {
    const entity = detectEntityForRow(row);
    if (!entity) {
      buckets.unknown.push(row);
      return;
    }
    buckets[entity].push(row);
  });

  return buckets;
}

function toNumber(value: string, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDate(value: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return parsed.toISOString();
}

export function mapImportRow(entity: ImportEntity, row: Record<string, string>) {
  const now = new Date().toISOString();

  if (entity === 'leads') {
    const name = pickValue(row, ['name', 'full_name', 'lead_name', 'lead', 'contact_name']);
    if (!name) {
      return null;
    }

    const statusRaw = pickValue(row, ['status', 'stage', 'lead_status']).toLowerCase();
    const sourceRaw = pickValue(row, ['source', 'lead_source', 'channel']).toLowerCase();

    return {
      name,
      email: pickValue(row, ['email', 'email_address']),
      phone: pickValue(row, ['phone', 'phone_number', 'mobile']),
      company: pickValue(row, ['company', 'organization', 'account']) || 'Unknown Company',
      status: LEAD_STATUSES.has(statusRaw) ? statusRaw : 'new',
      source: LEAD_SOURCES.has(sourceRaw) ? sourceRaw : 'website',
      assigned_to: pickValue(row, ['assigned_to', 'owner', 'assigned_user']),
      created_at: normalizeDate(pickValue(row, ['created_at', 'created_on']), now),
      updated_at: normalizeDate(pickValue(row, ['updated_at', 'updated_on']), now),
    };
  }

  if (entity === 'opportunities') {
    const name = pickValue(row, ['name', 'opportunity_name', 'deal_name', 'account_name']);
    if (!name) {
      return null;
    }

    const stageRaw = pickValue(row, ['stage', 'status', 'opportunity_stage']).toLowerCase();

    return {
      name,
      lead_id: pickValue(row, ['lead_id', 'lead', 'lead_reference']) || crypto.randomUUID(),
      amount: toNumber(pickValue(row, ['amount', 'value', 'arr']), 0),
      currency: pickValue(row, ['currency']) || 'USD',
      stage: OPPORTUNITY_STAGES.has(stageRaw) ? stageRaw : 'prospecting',
      close_date: normalizeDate(pickValue(row, ['close_date', 'close', 'expected_close_date']), now),
      probability: toNumber(pickValue(row, ['probability', 'confidence']), 50),
      assigned_to: pickValue(row, ['assigned_to', 'owner', 'assigned_user']),
      created_at: normalizeDate(pickValue(row, ['created_at', 'created_on']), now),
      updated_at: normalizeDate(pickValue(row, ['updated_at', 'updated_on']), now),
    };
  }

  const name = pickValue(row, ['name', 'deal_name', 'account_name', 'opportunity_name']);
  if (!name) {
    return null;
  }

  const statusRaw = pickValue(row, ['status', 'deal_status', 'stage']).toLowerCase();

  return {
    name,
    value: toNumber(pickValue(row, ['value', 'amount', 'arr']), 0),
    currency: pickValue(row, ['currency']) || 'USD',
    status: DEAL_STATUSES.has(statusRaw) ? statusRaw : 'pipeline',
    close_date: normalizeDate(pickValue(row, ['close_date', 'close', 'expected_close_date']), now),
    team_id: pickValue(row, ['team_id', 'team']) || 'unassigned',
    created_by: pickValue(row, ['created_by', 'owner', 'sales_rep']) || 'system',
    created_at: normalizeDate(pickValue(row, ['created_at', 'created_on']), now),
    updated_at: normalizeDate(pickValue(row, ['updated_at', 'updated_on']), now),
  };
}