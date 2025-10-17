-- Simple RLS Fix - No Recursion
-- Run this in Supabase Dashboard SQL Editor

-- Drop ALL policies on profiles
DROP POLICY IF EXISTS "Users can view profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple policy: users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
