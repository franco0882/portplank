import { useState, useEffect } from 'react';
import { generateMockData } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useClients = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!userProfile?.agency_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Use mock data for demo
      const data = generateMockData.clients();
      setClients(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
      // Use mock data as fallback
      const data = generateMockData.clients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [userProfile?.agency_id]);

  const createClient = async (clientData: any) => {
    try {
      // For demo, just add to local state
      const newClient = {
        id: `mock-client-${Date.now()}`,
        ...clientData,
        agency_id: userProfile?.agency_id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setClients(prev => [newClient, ...prev]);
      toast.success('Client created successfully');
      return newClient;
    } catch (err: any) {
      console.error('Error creating client:', err);
      toast.error('Failed to create client');
      throw err;
    }
  };

  const updateClient = async (id: string, updates: any) => {
    try {
      // For demo, just update local state
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...updates, updated_at: new Date().toISOString() } : client
      ));
      toast.success('Client updated successfully');
      return { ...updates, id };
    } catch (err: any) {
      console.error('Error updating client:', err);
      toast.error('Failed to update client');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setClients(prev => prev.filter(client => client.id !== id));
      toast.success('Client deleted successfully');
    } catch (err: any) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client');
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
};

export const useTemplates = () => {
  const { userProfile } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!userProfile?.agency_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Use mock data for demo
      const data = generateMockData.templates();
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message);
      // Use mock data as fallback
      const data = generateMockData.templates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [userProfile?.agency_id]);

  const createTemplate = async (templateData: any) => {
    try {
      // For demo, just add to local state
      const newTemplate = {
        id: `mock-template-${Date.now()}`,
        ...templateData,
        agency_id: userProfile?.agency_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (err: any) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: any) => {
    try {
      setTemplates(prev => prev.map(template => 
        template.id === id ? { ...template, ...updates, updated_at: new Date().toISOString() } : template
      ));
      toast.success('Template updated successfully');
      return { ...updates, id };
    } catch (err: any) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Template deleted successfully');
    } catch (err: any) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};

export const useTasks = (clientId?: string) => {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Use mock data for demo
      const data = generateMockData.tasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
      // Use mock data as fallback
      const data = generateMockData.tasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchTasks();
    }
  }, [userProfile]);

  const createTask = async (taskData: any) => {
    try {
      // For demo, just add to local state
      const newTask = {
        id: `mock-task-${Date.now()}`,
        ...taskData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully');
      return newTask;
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      ));
      toast.success('Task updated successfully');
      return { ...updates, id };
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
      throw err;
    }
  };

  const createTasksFromTemplate = async (clientId: string, templateId: string) => {
    try {
      // For demo, create some mock tasks
      const newTasks = [
        {
          id: `mock-task-${Date.now()}-1`,
          client_id: clientId,
          template_task_id: 'template-task-1',
          title: 'Welcome Call',
          description: 'Initial welcome and orientation call',
          task_type: 'meeting_scheduling',
          status: 'pending',
          order_index: 1,
          required: true,
          estimated_duration: 30,
          instructions: 'Schedule and complete welcome call with client',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      setTasks(prev => [...newTasks, ...prev]);
      toast.success('Tasks created from template');
      return newTasks;
    } catch (err: any) {
      console.error('Error creating tasks from template:', err);
      toast.error('Failed to create tasks from template');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    createTasksFromTemplate,
    refetch: fetchTasks,
  };
};