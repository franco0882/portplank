export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  primary_color?: string;
  secondary_color?: string;
  billing_address?: string;
  billing_city?: string;
  billing_zip?: string;
  billing_country?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'agency_owner' | 'agency_admin' | 'client';
  agency_id: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  agency_id: string;
  name: string;
  description?: string;
  tasks: TemplateTask[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateTask {
  id: string;
  title: string;
  description: string;
  task_type: TaskType;
  order_index: number;
  required: boolean;
  estimated_duration?: number;
  instructions?: string;
  metadata?: Record<string, any>;
}

export interface Client {
  id: string;
  agency_id: string;
  email: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'completed';
  onboarding_template_id?: string;
  assigned_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  template_task_id?: string;
  title: string;
  description: string;
  task_type: TaskType;
  status: TaskStatus;
  order_index: number;
  required: boolean;
  due_date?: string;
  estimated_duration?: number;
  instructions?: string;
  metadata?: Record<string, any>;
  wait_until?: string;
  wait_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  client_id: string;
  submission_type: 'text' | 'file' | 'link' | 'account_created';
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  metadata?: Record<string, any>;
  submitted_at: string;
}

export interface Communication {
  id: string;
  task_id: string;
  sender_id: string;
  message: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'message_received';
  read: boolean;
  related_task_id?: string;
  created_at: string;
}

export type TaskType = 
  | 'account_creation'
  | 'manual_task'
  | 'document_upload'
  | 'review_approval'
  | 'form_completion'
  | 'video_recording'
  | 'meeting_scheduling';

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'waiting'
  | 'blocked'
  | 'cancelled';

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: Agency;
        Insert: Omit<Agency, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Agency, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      task_submissions: {
        Row: TaskSubmission;
        Insert: Omit<TaskSubmission, 'id' | 'submitted_at'>;
        Update: Partial<Omit<TaskSubmission, 'id' | 'submitted_at'>>;
      };
      communications: {
        Row: Communication;
        Insert: Omit<Communication, 'id' | 'created_at'>;
        Update: Partial<Omit<Communication, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}