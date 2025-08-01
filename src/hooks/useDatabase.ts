import { useState, useEffect } from 'react';
import { DatabaseService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useClients = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!userProfile?.agency_id) return;
    
    try {
      setLoading(true);
      const data = await DatabaseService.getClients(userProfile.agency_id);
      setClients(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [userProfile?.agency_id]);

  const createClient = async (clientData: any) => {
    try {
      const newClient = await DatabaseService.createClient({
        ...clientData,
        agency_id: userProfile?.agency_id,
      });
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
      const updatedClient = await DatabaseService.updateClient(id, updates);
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      toast.success('Client updated successfully');
      return updatedClient;
    } catch (err: any) {
      console.error('Error updating client:', err);
      toast.error('Failed to update client');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await DatabaseService.deleteClient(id);
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
    if (!userProfile?.agency_id) return;
    
    try {
      setLoading(true);
      const data = await DatabaseService.getTemplates(userProfile.agency_id);
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [userProfile?.agency_id]);

  const createTemplate = async (templateData: any) => {
    try {
      const newTemplate = await DatabaseService.createTemplate({
        ...templateData,
        agency_id: userProfile?.agency_id,
      });
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
      const updatedTemplate = await DatabaseService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      toast.success('Template updated successfully');
      return updatedTemplate;
    } catch (err: any) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await DatabaseService.deleteTemplate(id);
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
    if (!userProfile?.agency_id && !clientId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let data;
      
      if (clientId) {
        data = await DatabaseService.getTasks(clientId);
      } else if (userProfile?.agency_id) {
        data = await DatabaseService.getTasksForAgency(userProfile.agency_id);
      } else {
        data = [];
      }
      
      setTasks(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
      // Don't show toast for demo data issues
      if (!err.message?.includes('demo-agency-id')) {
        toast.error('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId || userProfile?.agency_id) {
      fetchTasks();
    }
  }, [clientId, userProfile?.agency_id]);

  const createTask = async (taskData: any) => {
    try {
      const newTask = await DatabaseService.createTask(taskData);
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
      const updatedTask = await DatabaseService.updateTask(id, updates);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
      throw err;
    }
  };

  const createTasksFromTemplate = async (clientId: string, templateId: string) => {
    try {
      const newTasks = await DatabaseService.createTasksFromTemplate(clientId, templateId);
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