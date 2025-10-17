-- Fix RLS Policies - Remove Infinite Recursion
-- Run this in Supabase Dashboard SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate profiles policies WITHOUT recursion
CREATE POLICY "Users can view profiles in own organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR organization_id IN (
    SELECT p.organization_id FROM profiles p WHERE p.id = auth.uid()
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
