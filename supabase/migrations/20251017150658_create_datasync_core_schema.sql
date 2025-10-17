/*
  # DataSync Core Schema

  ## Overview
  Complete multi-tenant content synchronization system with:
  - Organization-based tenant isolation
  - User authentication and role-based access
  - Content type definitions with flexible JSON schemas
  - Content items with draft/published/archived lifecycle
  - Sites as publishing destinations with credentials
  - Mappings between items and sites with mode control
  - Sync jobs with live logging and audit trail

  ## New Tables

  ### `organizations`
  Tenant boundary for multi-tenant isolation
  - `id` (uuid, pk) - Unique org identifier
  - `name` (text) - Organization display name
  - `slug` (text, unique) - URL-safe identifier
  - `created_at` (timestamptz) - Creation timestamp

  ### `profiles`
  Links authenticated users to organizations with roles
  - `id` (uuid, pk, fk to auth.users) - User ID
  - `organization_id` (uuid, fk) - Parent organization
  - `email` (text) - User email
  - `role` (text) - admin or member
  - `created_at` (timestamptz) - Creation timestamp

  ### `content_types`
  Schema definitions for content items
  - `id` (uuid, pk) - Unique type identifier
  - `organization_id` (uuid, fk) - Parent organization
  - `name` (text) - Display name
  - `slug` (text) - URL-safe identifier
  - `schema` (jsonb) - Field definitions array
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `content_items`
  Actual content instances conforming to types
  - `id` (uuid, pk) - Unique item identifier
  - `organization_id` (uuid, fk) - Parent organization
  - `content_type_id` (uuid, fk) - Type reference
  - `title` (text) - Display title
  - `data` (jsonb) - Content payload
  - `status` (text) - draft, published, or archived
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `sites`
  Publishing destinations with credentials
  - `id` (uuid, pk) - Unique site identifier
  - `organization_id` (uuid, fk) - Parent organization
  - `name` (text) - Display name
  - `slug` (text) - URL-safe identifier
  - `destination_url` (text) - Webhook endpoint URL
  - `destination_secret` (text) - HMAC signing secret
  - `last_sync_status` (text) - success, partial, failed, or null
  - `last_sync_at` (timestamptz) - Last sync timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### `site_item_mappings`
  Which items go to which sites with mode control
  - `id` (uuid, pk) - Unique mapping identifier
  - `site_id` (uuid, fk) - Target site
  - `content_item_id` (uuid, fk) - Source item
  - `mode` (text) - full, override, or block
  - `overrides` (jsonb) - Site-specific field overrides
  - `created_at` (timestamptz) - Creation timestamp

  ### `sync_jobs`
  Job execution records with status tracking
  - `id` (uuid, pk) - Unique job identifier
  - `organization_id` (uuid, fk) - Parent organization
  - `status` (text) - queued, running, success, partial, or failed
  - `trigger` (text) - manual, cron
  - `created_by` (uuid, fk, nullable) - User who triggered (null for cron)
  - `started_at` (timestamptz) - Execution start time
  - `completed_at` (timestamptz, nullable) - Execution end time
  - `created_at` (timestamptz) - Creation timestamp

  ### `job_logs`
  Append-only log entries for observability
  - `id` (uuid, pk) - Unique log identifier
  - `job_id` (uuid, fk) - Parent job
  - `level` (text) - info, warn, or error
  - `message` (text) - Log message
  - `site_id` (uuid, fk, nullable) - Related site
  - `content_item_id` (uuid, fk, nullable) - Related item
  - `payload` (jsonb, nullable) - Captured data
  - `created_at` (timestamptz) - Log timestamp

  ### `destination_snapshots`
  Latest received payload per site
  - `id` (uuid, pk) - Unique snapshot identifier
  - `site_id` (uuid, fk, unique) - Target site (one snapshot per site)
  - `payload` (jsonb) - Last received content
  - `received_at` (timestamptz) - Receipt timestamp
  - `item_count` (integer) - Number of items
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Row Level Security enabled on all tables
  - Policies enforce organization-based isolation
  - Users can only access data within their organization
  - All operations require authentication
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create content_types table
CREATE TABLE IF NOT EXISTS content_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content_type_id uuid NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  title text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  destination_url text NOT NULL,
  destination_secret text NOT NULL,
  last_sync_status text CHECK (last_sync_status IN ('success', 'partial', 'failed')),
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Create site_item_mappings table
CREATE TABLE IF NOT EXISTS site_item_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'full' CHECK (mode IN ('full', 'override', 'block')),
  overrides jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(site_id, content_item_id)
);

ALTER TABLE site_item_mappings ENABLE ROW LEVEL SECURITY;

-- Create sync_jobs table
CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'partial', 'failed')),
  trigger text NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'cron')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Create job_logs table
CREATE TABLE IF NOT EXISTS job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES sync_jobs(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  content_item_id uuid REFERENCES content_items(id) ON DELETE SET NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Create destination_snapshots table
CREATE TABLE IF NOT EXISTS destination_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid UNIQUE NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  received_at timestamptz DEFAULT now(),
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE destination_snapshots ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_types_org ON content_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_items_org ON content_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(content_type_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_sites_org ON sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_mappings_site ON site_item_mappings(site_id);
CREATE INDEX IF NOT EXISTS idx_mappings_item ON site_item_mappings(content_item_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_org ON sync_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_logs_job ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_created ON job_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_destination_snapshots_site ON destination_snapshots(site_id);

-- RLS Policies for organizations
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in own organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for content_types
CREATE POLICY "Users can view content types in own organization"
  ON content_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create content types in own organization"
  ON content_types FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update content types in own organization"
  ON content_types FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content types in own organization"
  ON content_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for content_items
CREATE POLICY "Users can view content items in own organization"
  ON content_items FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create content items in own organization"
  ON content_items FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update content items in own organization"
  ON content_items FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content items in own organization"
  ON content_items FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for sites
CREATE POLICY "Users can view sites in own organization"
  ON sites FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create sites in own organization"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update sites in own organization"
  ON sites FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sites in own organization"
  ON sites FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for site_item_mappings
CREATE POLICY "Users can view mappings in own organization"
  ON site_item_mappings FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create mappings in own organization"
  ON site_item_mappings FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update mappings in own organization"
  ON site_item_mappings FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete mappings in own organization"
  ON site_item_mappings FOR DELETE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for sync_jobs
CREATE POLICY "Users can view sync jobs in own organization"
  ON sync_jobs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create sync jobs in own organization"
  ON sync_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update sync jobs in own organization"
  ON sync_jobs FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for job_logs
CREATE POLICY "Users can view job logs in own organization"
  ON job_logs FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM sync_jobs WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create job logs in own organization"
  ON job_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM sync_jobs WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for destination_snapshots
CREATE POLICY "Users can view snapshots in own organization"
  ON destination_snapshots FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create snapshots in own organization"
  ON destination_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update snapshots in own organization"
  ON destination_snapshots FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
