/*
  # Fix RLS infinite recursion policies

  1. Problem Analysis
    - Current policies have complex subqueries that reference the same tables
    - Policies on users table reference users table causing infinite recursion
    - Agency-based policies create circular dependencies

  2. Solution
    - Simplify policies to use direct column comparisons
    - Remove complex subqueries that cause recursion
    - Use auth.uid() directly where possible
    - Create security definer functions for complex access patterns

  3. Changes
    - Drop existing problematic policies
    - Create simple, non-recursive policies
    - Add security definer function for agency-based access
*/

-- First, disable RLS temporarily to avoid issues while updating
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Agency admins can manage agency users" ON users;
DROP POLICY IF EXISTS "Agency admins can view agency users" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

DROP POLICY IF EXISTS "Agency users can manage clients" ON clients;
DROP POLICY IF EXISTS "Clients can be viewed by their agency" ON clients;

DROP POLICY IF EXISTS "Agency users can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can update their own task status" ON tasks;
DROP POLICY IF EXISTS "Tasks can be viewed by client or agency users" ON tasks;

DROP POLICY IF EXISTS "Agency users can manage templates" ON templates;
DROP POLICY IF EXISTS "Templates can be viewed by agency users" ON templates;

-- Create a security definer function to get user's agency_id safely
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Create simple policies for clients table
CREATE POLICY "Users can view agency clients" ON clients
  FOR SELECT
  TO authenticated
  USING (agency_id = get_user_agency_id());

CREATE POLICY "Users can manage agency clients" ON clients
  FOR ALL
  TO authenticated
  USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

-- Create simple policies for tasks table
CREATE POLICY "Users can view agency tasks" ON tasks
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE agency_id = get_user_agency_id()
  ));

CREATE POLICY "Users can manage agency tasks" ON tasks
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE agency_id = get_user_agency_id()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE agency_id = get_user_agency_id()
  ));

-- Create simple policies for templates table
CREATE POLICY "Users can view agency templates" ON templates
  FOR SELECT
  TO authenticated
  USING (agency_id = get_user_agency_id());

CREATE POLICY "Users can manage agency templates" ON templates
  FOR ALL
  TO authenticated
  USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

-- Re-enable RLS with new policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;