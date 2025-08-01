import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckSquare, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClients, useTasks } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const AnalyticsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const { tasks, loading: tasksLoading } = useTasks();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const loading = clientsLoading || tasksLoading;

  const getAnalytics = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const completedClients = clients.filter(c => c.status === 'completed').length;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const clientCompletionRate = totalClients > 0 ? (completedClients / totalClients) * 100 : 0;

    return {
      totalClients,
      activeClients,
      completedClients,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      clientCompletionRate,
    };
  };

  const analytics = getAnalytics();

  const getTaskTypeBreakdown = () => {
    const breakdown: Record<string, number> = {};
    tasks.forEach(task => {
      breakdown[task.task_type] = (breakdown[task.task_type] || 0) + 1;
    });
    return breakdown;
  };

  const taskTypeBreakdown = getTaskTypeBreakdown();

  const getRecentActivity = () => {
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };

    const cutoffDate = new Date(now.getTime() - timeRangeMs[timeRange]);
    
    const recentClients = clients.filter(c => new Date(c.created_at) > cutoffDate);
    const recentTasks = tasks.filter(t => new Date(t.created_at) > cutoffDate);
    const recentCompletions = tasks.filter(t => 
      t.status === 'completed' && new Date(t.updated_at) > cutoffDate
    );

    return {
      newClients: recentClients.length,
      newTasks: recentTasks.length,
      completedTasks: recentCompletions.length,
    };
  };

  const recentActivity = getRecentActivity();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your agency's performance and client onboarding metrics
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalClients}</p>
              <p className="text-xs text-green-600">+{recentActivity.newClients} this {timeRange}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.completionRate)}%</p>
              <ProgressBar value={analytics.completionRate} size="sm" className="mt-1" />
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
              <p className="text-2xl font-bold text-gray-900">{analytics.pendingTasks}</p>
              {analytics.overdueTasks > 0 && (
                <p className="text-xs text-red-600">{analytics.overdueTasks} overdue</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Client Success</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.clientCompletionRate)}%</p>
              <p className="text-xs text-gray-600">{analytics.completedClients} completed</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Type Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(taskTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / analytics.totalTasks) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">New Clients</span>
              </div>
              <Badge variant="info">{recentActivity.newClients}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Tasks Completed</span>
              </div>
              <Badge variant="success">{recentActivity.completedTasks}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">New Tasks</span>
              </div>
              <Badge variant="warning">{recentActivity.newTasks}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Status Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.activeClients}</div>
            <div className="text-sm text-gray-600">Active Clients</div>
            <ProgressBar 
              value={(analytics.activeClients / analytics.totalClients) * 100} 
              variant="default" 
              className="mt-2"
            />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{analytics.completedClients}</div>
            <div className="text-sm text-gray-600">Completed Onboarding</div>
            <ProgressBar 
              value={(analytics.completedClients / analytics.totalClients) * 100} 
              variant="success" 
              className="mt-2"
            />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {analytics.totalClients - analytics.activeClients - analytics.completedClients}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
            <ProgressBar 
              value={((analytics.totalClients - analytics.activeClients - analytics.completedClients) / analytics.totalClients) * 100} 
              variant="warning" 
              className="mt-2"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};