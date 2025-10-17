import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
      };
      content_types: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          schema: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          schema?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          schema?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          organization_id: string;
          content_type_id: string;
          title: string;
          data: any;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          content_type_id: string;
          title: string;
          data?: any;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          content_type_id?: string;
          title?: string;
          data?: any;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      sites: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          destination_url: string;
          destination_secret: string;
          last_sync_status: 'success' | 'partial' | 'failed' | null;
          last_sync_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          destination_url: string;
          destination_secret: string;
          last_sync_status?: 'success' | 'partial' | 'failed' | null;
          last_sync_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          destination_url?: string;
          destination_secret?: string;
          last_sync_status?: 'success' | 'partial' | 'failed' | null;
          last_sync_at?: string | null;
          created_at?: string;
        };
      };
      site_item_mappings: {
        Row: {
          id: string;
          site_id: string;
          content_item_id: string;
          mode: 'full' | 'override' | 'block';
          overrides: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          content_item_id: string;
          mode?: 'full' | 'override' | 'block';
          overrides?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          content_item_id?: string;
          mode?: 'full' | 'override' | 'block';
          overrides?: any;
          created_at?: string;
        };
      };
      sync_jobs: {
        Row: {
          id: string;
          organization_id: string;
          status: 'queued' | 'running' | 'success' | 'partial' | 'failed';
          trigger: 'manual' | 'cron';
          created_by: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          status?: 'queued' | 'running' | 'success' | 'partial' | 'failed';
          trigger?: 'manual' | 'cron';
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          status?: 'queued' | 'running' | 'success' | 'partial' | 'failed';
          trigger?: 'manual' | 'cron';
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      job_logs: {
        Row: {
          id: string;
          job_id: string;
          level: 'info' | 'warn' | 'error';
          message: string;
          site_id: string | null;
          content_item_id: string | null;
          payload: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          level?: 'info' | 'warn' | 'error';
          message: string;
          site_id?: string | null;
          content_item_id?: string | null;
          payload?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          level?: 'info' | 'warn' | 'error';
          message?: string;
          site_id?: string | null;
          content_item_id?: string | null;
          payload?: any | null;
          created_at?: string;
        };
      };
      destination_snapshots: {
        Row: {
          id: string;
          site_id: string;
          payload: any;
          received_at: string;
          item_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          payload: any;
          received_at?: string;
          item_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          payload?: any;
          received_at?: string;
          item_count?: number;
          created_at?: string;
        };
      };
    };
  };
};
