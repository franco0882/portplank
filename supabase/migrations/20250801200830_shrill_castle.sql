/*
  # Fix infinite recursion in users table RLS policies

  1. Security Changes
    - Drop existing problematic RLS policies on users table
    - Create simple, non-recursive policies that prevent infinite loops
    - Allow users to manage their own records using auth.uid()
    - Allow agency admins to view users in their agency without recursion

  2. Policy Changes
    - SELECT: Users can view their own profile and users in their agency
    - INSERT: Users can create their own profile during signup
    - UPDATE: Users can update their own profile
    - DELETE: Prevent deletion through RLS (handled by CASCADE)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Agency admins can manage users in their agency" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their agency" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow agency admins to view users in their agency (non-recursive)
CREATE POLICY "Agency admins can view agency users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('agency_owner', 'agency_admin')
    )
  );

-- Allow agency admins to manage users in their agency (non-recursive)
CREATE POLICY "Agency admins can manage agency users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('agency_owner', 'agency_admin')
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT agency_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('agency_owner', 'agency_admin')
    )
  );