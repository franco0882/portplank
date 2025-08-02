import { supabase } from './supabase';
import { Database, User } from '../types/database';

type Tables = Database['public']['Tables'];

export class DatabaseService {
  // Users
  static async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // If no user profile exists, return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('User profile not found for ID:', id);
        return null;
      }
      console.error('Database error fetching user:', error);
      throw error;
    }
    console.log('User profile fetched successfully:', data);
    return data;
  }

  static async updateUser(id: string, updates: Partial<Tables['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Agencies
  static async getAgency(id: string) {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAgency(id: string, updates: Partial<Tables['agencies']['Update']>) {
    const { data, error } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Clients
  static async getClients(agencyId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createClient(client: Tables['clients']['Insert']) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateClient(id: string, updates: Partial<Tables['clients']['Update']>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteClient(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Templates
  static async getTemplates(agencyId: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTemplate(template: Tables['templates']['Insert']) {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<Tables['templates']['Update']>) {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Tasks
  static async getTasks(clientId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getTasksForAgency(agencyId: string) {
    // First get clients for the agency
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('agency_id', agencyId);
    
    if (clientsError) throw clientsError;
    
    if (!clients || clients.length === 0) {
      return [];
    }
    
    const clientIds = clients.map(client => client.id);
    
    // Then get tasks for those clients
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTask(task: Tables['tasks']['Insert']) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<Tables['tasks']['Update']>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createTasksFromTemplate(clientId: string, templateId: string) {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Create tasks from template
    const tasks = template.tasks.map((templateTask: any) => ({
      client_id: clientId,
      template_task_id: templateTask.id,
      title: templateTask.title,
      description: templateTask.description,
      task_type: templateTask.task_type,
      order_index: templateTask.order_index,
      required: templateTask.required,
      estimated_duration: templateTask.estimated_duration,
      instructions: templateTask.instructions,
      metadata: templateTask.metadata || {},
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (error) throw error;
    return data;
  }

  // Task Submissions
  static async getTaskSubmissions(taskId: string) {
    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTaskSubmission(submission: Tables['task_submissions']['Insert']) {
    const { data, error } = await supabase
      .from('task_submissions')
      .insert(submission)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Communications
  static async getCommunications(taskId: string) {
    const { data, error } = await supabase
      .from('communications')
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createCommunication(communication: Tables['communications']['Insert']) {
    const { data, error } = await supabase
      .from('communications')
      .insert(communication)
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Notifications
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async markNotificationAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) throw error;
  }

  // File uploads
  static async uploadFile(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { ...data, publicUrl };
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
}