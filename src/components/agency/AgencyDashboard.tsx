import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, Clock, TrendingUp, Plus, UserPlus, BookTemplate as FileTemplate, Settings } from 'lucide-react';
import { useStripe } from '../../hooks/useStripe';
import { useClients, useTasks } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SubscriptionStatus } from '../subscription/SubscriptionStatus';

export const AgencyDashboard: React.FC = () => {
  const { getCurrentPlan, isActiveSubscription } = useStripe();
  const { clients, loading: clientsLoading } = useClients();
  const { tasks, loading: tasksLoading } = useTasks();

  const currentPlan = getCurrentPlan();
  const hasActiveSubscription = isActiveSubscription();
  const loading = clientsLoading || tasksLoading;

  const activeClients = clients.filter(client => client.status === 'active').length;
  const completedClients = clients.filter(client => client.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  const recentClients = clients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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
          <Link to="/dashboard/employees">
            <Button variant="secondary" icon={UserPlus}>
              Manage Team
            </Button>
          </Link>
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
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
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

        {/* Task Overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
            <Link to="/dashboard/tasks">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => {
              const client = clients.find(c => c.id === task.client_id);
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{client?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {task.task_type.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge variant={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in_progress' ? 'info' :
                    task.status === 'waiting' ? 'warning' : 'default'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};