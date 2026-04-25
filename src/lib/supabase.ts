import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey);

// Database types - extend this as your schema grows
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          role: 'admin' | 'manager' | 'sales_rep';
          created_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          company: string;
          status: string;
          source: string;
          assigned_to?: string;
          created_at: string;
          updated_at: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          name: string;
          lead_id: string;
          amount: number;
          currency: string;
          stage: string;
          close_date: string;
          probability: number;
          assigned_to?: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
