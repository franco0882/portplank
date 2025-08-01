import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, Filter, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TaskCard } from './TaskCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const TaskManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { tasks, loading, updateTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'waiting'>('all');

  const isClient = userProfile?.role === 'client';

  const handleTaskSubmit = async (taskId: string, submission: any) => {
    try {
      // Create submission and update task status
      await updateTask(taskId, { status: 'completed' });
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { status });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      waiting: tasks.filter(t => t.status === 'waiting').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isClient ? 'Your Tasks' : 'Task Management'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isClient 
            ? 'Complete your onboarding tasks to get started'
            : 'Monitor and manage all client tasks across your agency'
          }
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <CheckSquare className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.all}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.in_progress}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.completed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.waiting}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
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
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
              <option value="completed">Completed ({statusCounts.completed})</option>
              <option value="waiting">Waiting ({statusCounts.waiting})</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            submissions={[]} // TODO: Load submissions
            onSubmit={handleTaskSubmit}
            onUpdateStatus={handleUpdateStatus}
            isClient={isClient}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : isClient 
                ? 'No tasks have been assigned to you yet'
                : 'No tasks exist yet. Create some clients and templates to get started.'
            }
          </p>
        </Card>
      )}
    </div>
  );
};