import { bucketRowsByEntity, mapImportRow } from '@/lib/dataImport';
import type { Deal, Lead, Opportunity, SalesActivity } from '@/types';

const now = new Date();

function iso(d: Date) {
  return d.toISOString();
}

function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return iso(d);
}

const SEED_LEADS: Lead[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Aisha Khan',
    email: 'aisha@northwind.io',
    phone: '+353-1-555-0101',
    company: 'Northwind Traders',
    status: 'qualified',
    source: 'website',
    assigned_to: 'Mia Carter',
    created_at: daysAgo(34),
    updated_at: daysAgo(2),
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    name: 'Ben OConnor',
    email: 'ben@contoso.ie',
    phone: '+353-1-555-0102',
    company: 'Contoso Labs',
    status: 'contacted',
    source: 'referral',
    assigned_to: 'Noah Park',
    created_at: daysAgo(28),
    updated_at: daysAgo(5),
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    name: 'Clara Murphy',
    email: 'clara@fabrikam.com',
    company: 'Fabrikam Retail',
    status: 'new',
    source: 'event',
    assigned_to: 'Ethan Ross',
    created_at: daysAgo(21),
    updated_at: daysAgo(1),
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    name: 'Diego Silva',
    email: 'diego@adventure-works.eu',
    company: 'Adventure Works',
    status: 'converted',
    source: 'email',
    assigned_to: 'Lena Shaw',
    created_at: daysAgo(60),
    updated_at: daysAgo(40),
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    name: 'Elena Popov',
    email: 'elena@wide-world-importers.com',
    company: 'Wide World Importers',
    status: 'qualified',
    source: 'cold_call',
    assigned_to: 'Mia Carter',
    created_at: daysAgo(14),
    updated_at: daysAgo(3),
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    name: 'Frank Walsh',
    email: 'frank@blue-yonder.ie',
    company: 'Blue Yonder Analytics',
    status: 'lost',
    source: 'social',
    assigned_to: 'Noah Park',
    created_at: daysAgo(45),
    updated_at: daysAgo(30),
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    name: 'Grace Ni',
    email: 'grace@tailspin-toys.com',
    company: 'Tailspin Toys',
    status: 'new',
    source: 'website',
    assigned_to: 'Ethan Ross',
    created_at: daysAgo(7),
    updated_at: daysAgo(0),
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    name: 'Hassan Ali',
    email: 'hassan@litware.com',
    company: 'Litware',
    status: 'contacted',
    source: 'referral',
    assigned_to: 'Lena Shaw',
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
  },
];

const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    name: 'Northwind CRM rollout',
    lead_id: '11111111-1111-4111-8111-111111111101',
    amount: 185000,
    currency: 'USD',
    stage: 'negotiation',
    close_date: daysAgo(-21),
    probability: 72,
    assigned_to: 'Mia Carter',
    created_at: daysAgo(40),
    updated_at: daysAgo(1),
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    name: 'Contoso data warehouse',
    lead_id: '11111111-1111-4111-8111-111111111102',
    amount: 92000,
    currency: 'EUR',
    stage: 'proposal',
    close_date: daysAgo(-45),
    probability: 55,
    assigned_to: 'Noah Park',
    created_at: daysAgo(25),
    updated_at: daysAgo(4),
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    name: 'Fabrikam POS upgrade',
    lead_id: '11111111-1111-4111-8111-111111111103',
    amount: 48000,
    currency: 'USD',
    stage: 'qualification',
    close_date: daysAgo(-60),
    probability: 40,
    assigned_to: 'Ethan Ross',
    created_at: daysAgo(18),
    updated_at: daysAgo(2),
  },
  {
    id: '22222222-2222-4222-8222-222222222204',
    name: 'Adventure Works support bundle',
    lead_id: '11111111-1111-4111-8111-111111111104',
    amount: 24000,
    currency: 'USD',
    stage: 'closed_won',
    close_date: daysAgo(35),
    probability: 100,
    assigned_to: 'Lena Shaw',
    created_at: daysAgo(70),
    updated_at: daysAgo(35),
  },
  {
    id: '22222222-2222-4222-8222-222222222205',
    name: 'Wide World logistics AI',
    lead_id: '11111111-1111-4111-8111-111111111105',
    amount: 310000,
    currency: 'USD',
    stage: 'prospecting',
    close_date: daysAgo(-90),
    probability: 25,
    assigned_to: 'Mia Carter',
    created_at: daysAgo(12),
    updated_at: daysAgo(1),
  },
  {
    id: '22222222-2222-4222-8222-222222222206',
    name: 'Blue Yonder renewal',
    lead_id: '11111111-1111-4111-8111-111111111106',
    amount: 56000,
    currency: 'EUR',
    stage: 'closed_lost',
    close_date: daysAgo(28),
    probability: 0,
    assigned_to: 'Noah Park',
    created_at: daysAgo(50),
    updated_at: daysAgo(28),
  },
  {
    id: '22222222-2222-4222-8222-222222222207',
    name: 'Tailspin Toys pilot',
    lead_id: '11111111-1111-4111-8111-111111111107',
    amount: 12000,
    currency: 'USD',
    stage: 'qualification',
    close_date: daysAgo(-14),
    probability: 48,
    assigned_to: 'Ethan Ross',
    created_at: daysAgo(6),
    updated_at: daysAgo(0),
  },
];

const SEED_DEALS: Deal[] = [
  {
    id: '33333333-3333-4333-8333-333333333301',
    name: 'Northwind enterprise FY deal',
    value: 210000,
    currency: 'USD',
    status: 'negotiation',
    close_date: daysAgo(-18),
    team_id: 'emea-north',
    created_by: 'Mia Carter',
    created_at: daysAgo(50),
    updated_at: daysAgo(2),
  },
  {
    id: '33333333-3333-4333-8333-333333333302',
    name: 'Contoso platform bundle',
    value: 142000,
    currency: 'USD',
    status: 'pipeline',
    close_date: daysAgo(-32),
    team_id: 'emea-south',
    created_by: 'Noah Park',
    created_at: daysAgo(30),
    updated_at: daysAgo(5),
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    name: 'Fabrikam Q1 expansion',
    value: 88000,
    currency: 'USD',
    status: 'won',
    close_date: daysAgo(12),
    team_id: 'amer-east',
    created_by: 'Ethan Ross',
    created_at: daysAgo(40),
    updated_at: daysAgo(12),
  },
  {
    id: '33333333-3333-4333-8333-333333333304',
    name: 'Adventure Works renewal',
    value: 36000,
    currency: 'USD',
    status: 'won',
    close_date: daysAgo(8),
    team_id: 'emea-north',
    created_by: 'Lena Shaw',
    created_at: daysAgo(90),
    updated_at: daysAgo(8),
  },
  {
    id: '33333333-3333-4333-8333-333333333305',
    name: 'Litware pilot conversion',
    value: 54000,
    currency: 'USD',
    status: 'lost',
    close_date: daysAgo(22),
    team_id: 'amer-west',
    created_by: 'Mia Carter',
    created_at: daysAgo(35),
    updated_at: daysAgo(22),
  },
  {
    id: '33333333-3333-4333-8333-333333333306',
    name: 'Tailspin Toys SMB pack',
    value: 19500,
    currency: 'USD',
    status: 'pipeline',
    close_date: daysAgo(-7),
    team_id: 'amer-east',
    created_by: 'Ethan Ross',
    created_at: daysAgo(9),
    updated_at: daysAgo(1),
  },
  {
    id: '33333333-3333-4333-8333-333333333307',
    name: 'Wide World strategic',
    value: 298000,
    currency: 'USD',
    status: 'negotiation',
    close_date: daysAgo(-40),
    team_id: 'emea-north',
    created_by: 'Noah Park',
    created_at: daysAgo(20),
    updated_at: daysAgo(3),
  },
  {
    id: '33333333-3333-4333-8333-333333333308',
    name: 'Blue Yonder analytics add-on',
    value: 41000,
    currency: 'EUR',
    status: 'won',
    close_date: daysAgo(55),
    team_id: 'emea-south',
    created_by: 'Lena Shaw',
    created_at: daysAgo(80),
    updated_at: daysAgo(55),
  },
];

const SEED_ACTIVITIES: SalesActivity[] = [
  {
    id: '44444444-4444-4444-8444-444444444401',
    user_id: 'u-mia',
    activity_type: 'deal_stage_changed',
    description: 'Moved Northwind enterprise FY deal to Negotiation',
    related_id: '33333333-3333-4333-8333-333333333301',
    timestamp: daysAgo(1),
  },
  {
    id: '44444444-4444-4444-8444-444444444402',
    user_id: 'u-noah',
    activity_type: 'meeting',
    description: 'Discovery workshop with Contoso RevOps',
    related_id: '33333333-3333-4333-8333-333333333302',
    timestamp: daysAgo(2),
  },
  {
    id: '44444444-4444-4444-8444-444444444403',
    user_id: 'u-ethan',
    activity_type: 'email',
    description: 'Sent revised proposal to Fabrikam buying committee',
    timestamp: daysAgo(3),
  },
  {
    id: '44444444-4444-4444-8444-444444444404',
    user_id: 'u-lena',
    activity_type: 'call',
    description: 'Quarterly check-in with Adventure Works champion',
    timestamp: daysAgo(5),
  },
  {
    id: '44444444-4444-4444-8444-444444444405',
    user_id: 'u-mia',
    activity_type: 'task',
    description: 'Prep leadership briefing for Wide World pipeline',
    timestamp: daysAgo(6),
  },
  {
    id: '44444444-4444-4444-8444-444444444406',
    user_id: 'u-noah',
    activity_type: 'note',
    description: 'Logged competitor intel on Blue Yonder renewal',
    timestamp: daysAgo(8),
  },
];

let leadsState = [...SEED_LEADS];
let opportunitiesState = [...SEED_OPPORTUNITIES];
let dealsState = [...SEED_DEALS];
let activitiesState = [...SEED_ACTIVITIES];

export function getDemoLeadsSnapshot(): Lead[] {
  return [...leadsState].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getDemoOpportunitiesSnapshot(): Opportunity[] {
  return [...opportunitiesState].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getDemoDealsSnapshot(): Deal[] {
  return [...dealsState].sort((a, b) => {
    const ta = new Date(a.close_date).getTime();
    const tb = new Date(b.close_date).getTime();
    return ta - tb;
  });
}

export function getDemoActivitiesSnapshot(limit: number): SalesActivity[] {
  return [...activitiesState]
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function appendRowsFromParsedImport(rows: Array<Record<string, string>>) {
  const buckets = bucketRowsByEntity(rows);
  let addedLeads = 0;
  let addedOpportunities = 0;
  let addedDeals = 0;

  buckets.leads.forEach((row) => {
    const mapped = mapImportRow('leads', row);
    if (!mapped) return;
    const id = newId();
    leadsState = [
      {
        id,
        name: mapped.name,
        email: mapped.email || '',
        phone: mapped.phone,
        company: mapped.company || 'Unknown Company',
        status: mapped.status as Lead['status'],
        source: mapped.source as Lead['source'],
        assigned_to: mapped.assigned_to,
        created_at: mapped.created_at,
        updated_at: mapped.updated_at,
      },
      ...leadsState,
    ];
    addedLeads += 1;
  });

  buckets.opportunities.forEach((row) => {
    const mapped = mapImportRow('opportunities', row);
    if (!mapped) return;
    const id = newId();
    opportunitiesState = [
      {
        id,
        name: mapped.name,
        lead_id: mapped.lead_id ?? newId(),
        amount: mapped.amount ?? 0,
        currency: mapped.currency ?? 'USD',
        stage: mapped.stage as Opportunity['stage'],
        close_date: mapped.close_date ?? new Date().toISOString(),
        probability: mapped.probability ?? 50,
        assigned_to: mapped.assigned_to,
        created_at: mapped.created_at ?? new Date().toISOString(),
        updated_at: mapped.updated_at ?? new Date().toISOString(),
      },
      ...opportunitiesState,
    ];
    addedOpportunities += 1;
  });

  buckets.deals.forEach((row) => {
    const mapped = mapImportRow('deals', row);
    if (!mapped) return;
    const id = newId();
    dealsState = [
      {
        id,
        name: mapped.name,
        value: mapped.value ?? 0,
        currency: mapped.currency ?? 'USD',
        status: mapped.status as Deal['status'],
        close_date: mapped.close_date ?? new Date().toISOString(),
        team_id: mapped.team_id ?? 'unassigned',
        created_by: mapped.created_by ?? 'system',
        created_at: mapped.created_at ?? new Date().toISOString(),
        updated_at: mapped.updated_at ?? new Date().toISOString(),
      },
      ...dealsState,
    ];
    addedDeals += 1;
  });

  if (addedLeads + addedOpportunities + addedDeals > 0) {
    activitiesState = [
      {
        id: newId(),
        user_id: 'demo-import',
        activity_type: 'note',
        description: `Imported ${addedLeads} leads, ${addedOpportunities} opportunities, ${addedDeals} deals from file`,
        timestamp: new Date().toISOString(),
      },
      ...activitiesState,
    ];
  }

  return {
    addedLeads,
    addedOpportunities,
    addedDeals,
    unknown: buckets.unknown.length,
  };
}

/** Pre-mapped rows from Data Aligner (same shape as `mapImportRow` output). */
export function appendAlignedRecords(payload: {
  leads: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  deals: Array<Record<string, unknown>>;
}) {
  let addedLeads = 0;
  let addedOpportunities = 0;
  let addedDeals = 0;

  payload.leads.forEach((raw) => {
    const m = raw as Partial<Lead> & { name?: string; company?: string };
    if (!m.name || !m.company) return;
    leadsState = [
      {
        id: newId(),
        name: m.name,
        email: m.email ?? '',
        phone: m.phone,
        company: m.company,
        status: (m.status ?? 'new') as Lead['status'],
        source: (m.source ?? 'website') as Lead['source'],
        assigned_to: m.assigned_to,
        created_at: m.created_at ?? new Date().toISOString(),
        updated_at: m.updated_at ?? new Date().toISOString(),
      },
      ...leadsState,
    ];
    addedLeads += 1;
  });

  payload.opportunities.forEach((raw) => {
    const m = raw as Partial<Opportunity> & { name?: string };
    if (!m.name) return;
    opportunitiesState = [
      {
        id: newId(),
        name: m.name,
        lead_id: m.lead_id ?? newId(),
        amount: Number(m.amount) || 0,
        currency: m.currency ?? 'USD',
        stage: (m.stage ?? 'prospecting') as Opportunity['stage'],
        close_date: m.close_date ?? new Date().toISOString(),
        probability: Number(m.probability) || 0,
        assigned_to: m.assigned_to,
        created_at: m.created_at ?? new Date().toISOString(),
        updated_at: m.updated_at ?? new Date().toISOString(),
      },
      ...opportunitiesState,
    ];
    addedOpportunities += 1;
  });

  payload.deals.forEach((raw) => {
    const m = raw as Partial<Deal> & { name?: string };
    if (!m.name) return;
    dealsState = [
      {
        id: newId(),
        name: m.name,
        value: Number(m.value) || 0,
        currency: m.currency ?? 'USD',
        status: (m.status ?? 'pipeline') as Deal['status'],
        close_date: m.close_date ?? new Date().toISOString(),
        team_id: m.team_id ?? 'unassigned',
        created_by: m.created_by ?? 'system',
        created_at: m.created_at ?? new Date().toISOString(),
        updated_at: m.updated_at ?? new Date().toISOString(),
      },
      ...dealsState,
    ];
    addedDeals += 1;
  });

  if (addedLeads + addedOpportunities + addedDeals > 0) {
    activitiesState = [
      {
        id: newId(),
        user_id: 'demo-aligner',
        activity_type: 'note',
        description: `Aligned upload: ${addedLeads} leads, ${addedOpportunities} opportunities, ${addedDeals} deals`,
        timestamp: new Date().toISOString(),
      },
      ...activitiesState,
    ];
  }

  return { addedLeads, addedOpportunities, addedDeals };
}
