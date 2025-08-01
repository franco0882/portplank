/*
  # Agency Onboarding Platform Schema

  1. New Tables
    - `agencies` - Multi-tenant agency data with branding customization
    - `users` - User accounts with role-based permissions (agency_owner, agency_admin, client)
    - `templates` - Reusable onboarding workflow templates
    - `clients` - Client information and agency associations
    - `tasks` - Individual onboarding tasks with types and statuses
    - `task_submissions` - Client task completions and file uploads
    - `communications` - In-task messaging system between agencies and clients
    - `notifications` - System notifications for users

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data isolation
    - Ensure clients can only access their own data
    - Agency users can only access their agency's data

  3. Enums and Types
    - User roles: agency_owner, agency_admin, client
    - Task types: account_creation, manual_task, document_upload, etc.
    - Task statuses: pending, in_progress, completed, waiting, blocked, cancelled
    - Client statuses: active, inactive, completed

  4. Features
    - Multi-tenant architecture with agency isolation
    - Extensible task system for different task types
    - File upload support with metadata
    - Real-time communication system
    - Progress tracking and analytics
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('agency_owner', 'agency_admin', 'client');
CREATE TYPE task_type AS ENUM ('account_creation', 'manual_task', 'document_upload', 'review_approval', 'form_completion', 'video_recording', 'meeting_scheduling');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'waiting', 'blocked', 'cancelled');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'completed');
CREATE TYPE submission_type AS ENUM ('text', 'file', 'link', 'account_created');
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_completed', 'task_overdue', 'message_received');

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#1F2937',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL,
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tasks jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  status client_status DEFAULT 'active',
  onboarding_template_id uuid REFERENCES templates(id),
  assigned_user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, email)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_task_id text,
  title text NOT NULL,
  description text NOT NULL,
  task_type task_type NOT NULL,
  status task_status DEFAULT 'pending',
  order_index integer NOT NULL DEFAULT 0,
  required boolean DEFAULT true,
  due_date timestamptz,
  estimated_duration integer, -- in minutes
  instructions text,
  metadata jsonb DEFAULT '{}',
  wait_until timestamptz,
  wait_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_type submission_type NOT NULL,
  content text,
  file_url text,
  file_name text,
  file_size bigint,
  metadata jsonb DEFAULT '{}',
  submitted_at timestamptz DEFAULT now()
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  file_url text,
  file_name text,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  read boolean DEFAULT false,
  related_task_id uuid REFERENCES tasks(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_templates_agency_id ON templates(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_communications_task_id ON communications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable Row Level Security
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencies
CREATE POLICY "Agencies can be viewed by their users"
  ON agencies FOR SELECT
  TO authenticated
  USING (id IN (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Agency owners can update their agency"
  ON agencies FOR UPDATE
  TO authenticated
  USING (id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role = 'agency_owner'));

-- RLS Policies for users
CREATE POLICY "Users can view users in their agency"
  ON users FOR SELECT
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Agency admins can manage users in their agency"
  ON users FOR ALL
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')));

-- RLS Policies for templates
CREATE POLICY "Templates can be viewed by agency users"
  ON templates FOR SELECT
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Agency users can manage templates"
  ON templates FOR ALL
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')));

-- RLS Policies for clients
CREATE POLICY "Clients can be viewed by their agency"
  ON clients FOR SELECT
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Agency users can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')));

-- RLS Policies for tasks
CREATE POLICY "Tasks can be viewed by client or agency users"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()))
    OR
    client_id IN (SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client'))
  );

CREATE POLICY "Agency users can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin'))));

CREATE POLICY "Clients can update their own task status"
  ON tasks FOR UPDATE
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client')));

-- RLS Policies for task_submissions
CREATE POLICY "Task submissions can be viewed by client or agency"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE client_id IN (
        SELECT id FROM clients WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
      )
    )
    OR
    client_id IN (SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client'))
  );

CREATE POLICY "Clients can create submissions for their tasks"
  ON task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client')));

-- RLS Policies for communications
CREATE POLICY "Communications can be viewed by task participants"
  ON communications FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE client_id IN (
        SELECT id FROM clients WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
      )
    )
    OR
    task_id IN (
      SELECT id FROM tasks WHERE client_id IN (
        SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client')
      )
    )
  );

CREATE POLICY "Task participants can create communications"
  ON communications FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      task_id IN (
        SELECT id FROM tasks WHERE client_id IN (
          SELECT id FROM clients WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
        )
      )
      OR
      task_id IN (
        SELECT id FROM tasks WHERE client_id IN (
          SELECT id FROM clients WHERE email = (SELECT email FROM users WHERE id = auth.uid() AND role = 'client')
        )
      )
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();