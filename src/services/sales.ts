import { supabase } from '@/lib/supabase';
import { Lead, Opportunity, Deal, SalesMetrics, SalesActivity } from '@/types';

const USE_MOCK_DASHBOARD_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD_DATA === 'true';

export class SalesService {
  // Leads
  static async getLeads(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  static async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Opportunities
  static async getOpportunities(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  static async createOpportunity(
    opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunity])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateOpportunity(id: string, updates: Partial<Opportunity>) {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deals
  static async getDeals(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('close_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  static async createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDeal(id: string, updates: Partial<Deal>) {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Activities
  static async getActivities(userId?: string, limit = 50) {
    let query = supabase.from('activities').select('*').order('timestamp', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;
    return data;
  }

  static async logActivity(activity: Omit<SalesActivity, 'id' | 'timestamp'>) {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ ...activity, timestamp: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async searchLeads(query: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }

  // Dashboard Metrics
  static async getSalesMetrics(): Promise<SalesMetrics> {
    if (USE_MOCK_DASHBOARD_DATA) {
      return {
        totalRevenue: {
          value: 305000,
          trend: { value: 12, direction: 'up' },
        },
        dealsWon: {
          value: 28,
          trend: { value: 8, direction: 'up' },
        },
        winRate: {
          value: 78,
          trend: { value: 5, direction: 'up' },
        },
        avgDealSize: {
          value: 12500,
          trend: { value: 3, direction: 'down' },
        },
      };
    }

    const { data: deals, error } = await supabase.from('deals').select('value, status');

    if (error) {
      return {
        totalRevenue: {
          value: 0,
          trend: { value: 0, direction: 'up' },
        },
        dealsWon: {
          value: 0,
          trend: { value: 0, direction: 'up' },
        },
        winRate: {
          value: 0,
          trend: { value: 0, direction: 'up' },
        },
        avgDealSize: {
          value: 0,
          trend: { value: 0, direction: 'up' },
        },
      };
    }

    const totalRevenue = deals.reduce((acc, deal) => acc + (deal.value || 0), 0);
    const dealsWon = deals.filter((deal) => deal.status === 'won').length;
    const totalDeals = deals.length;
    const winRate = totalDeals > 0 ? (dealsWon / totalDeals) * 100 : 0;
    const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    // Mocking trend data for now
    return {
      totalRevenue: {
        value: totalRevenue,
        trend: { value: 12, direction: 'up' },
      },
      dealsWon: {
        value: dealsWon,
        trend: { value: 8, direction: 'up' },
      },
      winRate: {
        value: winRate,
        trend: { value: 5, direction: 'up' },
      },
      avgDealSize: {
        value: avgDealSize,
        trend: { value: 3, direction: 'down' },
      },
    };
  }

  static async getRevenueTrend() {
    if (USE_MOCK_DASHBOARD_DATA) {
      return [
        { name: 'Jan', value: 40000 },
        { name: 'Feb', value: 45000 },
        { name: 'Mar', value: 52000 },
        { name: 'Apr', value: 48000 },
        { name: 'May', value: 61000 },
        { name: 'Jun', value: 59000 },
      ];
    }

    const { data, error } = await supabase
      .from('deals')
      .select('close_date, value')
      .eq('status', 'won')
      .order('close_date', { ascending: true });

    if (error) {
      return [];
    }

    const formatData = (deals: Array<{ close_date: string; value: number }>) => {
      const monthlyRevenue = deals.reduce<Record<string, number>>((acc, deal) => {
        const month = new Date(deal.close_date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + deal.value;
        return acc;
      }, {});

      return Object.keys(monthlyRevenue).map(month => ({
        name: month,
        value: monthlyRevenue[month],
      }));
    };

    return formatData(data);
  }

  static async getPipelineOverview() {
    if (USE_MOCK_DASHBOARD_DATA) {
      return [
        { name: 'Prospecting', value: 150000, deals: 12 },
        { name: 'Qualification', value: 120000, deals: 8 },
        { name: 'Proposal', value: 80000, deals: 5 },
        { name: 'Negotiation', value: 45000, deals: 2 },
      ];
    }

    const { data, error } = await supabase
      .from('deals')
      .select('status, value')
      .in('status', ['pipeline', 'negotiation', 'proposal', 'qualification']);

    if (error) {
      return [];
    }

    const pipelineData = data.reduce<Record<string, { value: number; deals: number }>>((acc, deal) => {
      const stage = typeof deal.status === 'string' ? deal.status : 'unknown';
      if (!acc[stage]) {
        acc[stage] = { value: 0, deals: 0 };
      }
      acc[stage].value += Number(deal.value) || 0;
      acc[stage].deals += 1;
      return acc;
    }, {});

    return Object.keys(pipelineData).map(stage => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: pipelineData[stage].value,
      deals: pipelineData[stage].deals,
    }));
  }

  static async getRecentActivity(limit = 5) {
    if (USE_MOCK_DASHBOARD_DATA) {
      return [
        {
          id: '1',
          user_id: 'u1',
          activity_type: 'deal_stage_changed',
          description: 'Moved ACME deal to Negotiation',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'u2',
          activity_type: 'meeting',
          description: 'Discovery call with Contoso team',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
          id: '3',
          user_id: 'u3',
          activity_type: 'email',
          description: 'Sent proposal follow-up email',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
        },
      ].slice(0, limit);
    }

    const { data, error } = await supabase
      .from('sales_activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data;
  }
}
