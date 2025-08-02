import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, Clock, TrendingUp, Plus, UserPlus, BookTemplate as FileTemplate, Settings, User, Crown } from 'lucide-react';
import { useStripe } from '../../hooks/useStripe';
import { useClients, useTasks } from '../../hooks/useDatabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { SubscriptionStatus } from '../subscription/SubscriptionStatus';

export const AgencyDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { getCurrentPlan, isActiveSubscription } = useStripe();
  const { clients, loading: clientsLoading } = useClients();
  const { tasks, loading: tasksLoading } = useTasks();

  const currentPlan = getCurrentPlan();
  const hasActiveSubscription = isActiveSubscription();
  const loading = clientsLoading || tasksLoading;

  const activeClients = clients.filter(client => client.status === 'active').length;
  const completedClients = clients.filter(client => client.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgTasksPerClient = clients.length > 0 ? Math.round(totalTasks / clients.length) : 0;

  const recentClients = clients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // For free plan, only show the owner
  const employees = [
    {
      id: userProfile?.id || '1',
      full_name: userProfile?.full_name || 'Agency Owner',
      email: userProfile?.email || 'owner@agency.com',
      role: 'agency_owner',
      avatar_url: userProfile?.avatar_url,
      created_at: new Date().toISOString(),
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your agency, employees, clients, and onboarding workflows
          </p>
          {currentPlan && (
            <div className="mt-2">
              <Badge variant={hasActiveSubscription ? 'success' : 'warning'} size="sm">
                {currentPlan.name.replace('Portplank - ', '')} - {hasActiveSubscription ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Link to="/dashboard/clients">
            <Button icon={Plus}>
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedClients}</p>
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
          </div>
              <p className="text-sm text-gray-600">Task Completion</p>
              <p className="text-xl font-bold text-gray-900">{taskCompletionRate}%</p>
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
            <CheckSquare className="w-5 h-5 text-purple-600 mr-2" />
              <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
              <p className="text-sm text-gray-600">Avg Tasks/Client</p>
              <p className="text-xl font-bold text-gray-900">{avgTasksPerClient}</p>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Client Success</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length > 0 ? Math.round((completedClients / clients.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Clients</h3>
            <Link to="/dashboard/clients">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.full_name}</p>
                  <p className="text-sm text-gray-600">{client.company_name}</p>
                  <p className="text-xs text-gray-500">
                    Added {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={client.status === 'completed' ? 'success' : 'info'}>
                  {client.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Current Employees */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Employees</h3>
            <Link to="/dashboard/employees">
              <Button variant="ghost" size="sm">
                Manage Team
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={employee.avatar_url}
                    alt={employee.full_name}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{employee.full_name}</p>
                      {employee.role === 'agency_owner' && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <p className="text-xs text-gray-500">
                      {employee.role === 'agency_owner' ? 'Owner' : 'Admin'}
                    </p>
                  </div>
                </div>
                <Badge variant={employee.role === 'agency_owner' ? 'success' : 'info'}>
                  {employee.role === 'agency_owner' ? 'Owner' : 'Admin'}
                </Badge>
              </div>
            ))}
            
            {/* Free Plan Limitation Notice */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Free Plan - 1 Employee</p>
                  <p className="text-xs text-yellow-700">
                    Upgrade to add more team members
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};