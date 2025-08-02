import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, User, Building, Mail, Phone } from 'lucide-react';
import { Template } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useClients, useTemplates } from '../../hooks/useDatabase';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import toast from 'react-hot-toast';

export const ClientManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient } = useClients();
  const { templates, loading: templatesLoading } = useTemplates();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');

  const loading = clientsLoading || templatesLoading;

  const handleAddClient = async (clientData: any) => {
    try {
      await createClient({
        ...clientData,
        assigned_user_id: userProfile?.id,
      });
      setShowAddForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteClient(clientId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCreateClientLogin = async (client: any) => {
    try {
      // Create auth user for client
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: client.email,
        password: tempPassword,
        email_confirm: true,
      });

      if (error) throw error;

      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: client.email,
        full_name: client.full_name,
        role: 'client',
        agency_id: client.agency_id,
      });

      toast.success(`Client login created. Temporary password: ${tempPassword}`);
    } catch (error: any) {
      toast.error('Failed to create client login');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'info';
      case 'completed':
        return 'success';
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your clients and their onboarding progress
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddForm(true)}>
          Add New Client
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Add Client Form */}
      {showAddForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h3>
          <AddClientForm
            templates={templates}
            onAdd={handleAddClient}
            onCancel={() => setShowAddForm(false)}
          />
        </Card>
      )}

      {/* Client List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const template = templates.find(t => t.id === client.onboarding_template_id);
          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <Avatar
                    src=""
                    alt={client.full_name}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                    {client.company_name && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Building className="w-3 h-3 mr-1" />
                        {client.company_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1" />
                      {client.email}
                    </p>
                    {client.phone && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {client.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    {
                      icon: Edit,
                      label: 'Edit Client',
                      onClick: () => console.log('Edit client'),
                    },
                    {
                      icon: User,
                      label: 'Create Login',
                      onClick: () => handleCreateClientLogin(client),
                    },
                    { type: 'separator' },
                    {
                      icon: Trash2,
                      label: 'Delete',
                      onClick: () => handleDeleteClient(client.id),
                    },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getStatusVariant(client.status)}>
                    {client.status}
                  </Badge>
                </div>
                
                {template && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Template:</span>
                    <span className="text-sm font-medium text-gray-900">{template.name}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = `/dashboard/clients/${client.id}/editor`}
                >
                  View Dashboard
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first client'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Client
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

interface AddClientFormProps {
  templates: Template[];
  onAdd: (client: any) => void;
  onCancel: () => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ templates, onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: '',
    onboarding_template_id: templates[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Smith"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company Inc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Onboarding Template
        </label>
        <select
          value={formData.onboarding_template_id}
          onChange={(e) => setFormData(prev => ({ ...prev, onboarding_template_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          This template will be used to create the client's onboarding tasks
        </p>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Client
        </Button>
      </div>
    </form>
  );
};