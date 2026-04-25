// User & Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export type UserRole = 'admin' | 'manager' | 'sales_rep';

// Sales Data Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'email' | 'event' | 'social';

export interface Opportunity {
  id: string;
  name: string;
  lead_id: string;
  amount: number;
  currency: string;
  stage: OpportunityStage;
  close_date: string;
  probability: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  status: DealStatus;
  close_date: string;
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DealStatus = 'pipeline' | 'negotiation' | 'won' | 'lost';

// Analytics & Dashboard Types
export interface SalesMetrics {
  totalRevenue: KPIData;
  dealsWon: KPIData;
  winRate: KPIData;
  avgDealSize: KPIData;
}

export interface KPIData {
  value: number;
  trend: {
    value: number;
    direction: 'up' | 'down';
  };
}

export interface RegionalData {
  region: string;
  revenue: number;
  deals: number;
  growth: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string;
  performance_score: number;
}

export interface SalesActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  related_id?: string;
  timestamp: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'deal_stage_changed';

// Dashboard Filter Types
export interface DashboardFilters {
  period: TimePeriod;
  team?: string;
  region?: string;
  status?: string;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
