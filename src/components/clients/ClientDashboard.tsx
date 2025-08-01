import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useStripe } from '../../hooks/useStripe';
import { useTasks } from '../../hooks/useDatabase';
import { DatabaseService } from '../../lib/database';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { TaskCard } from '../tasks/TaskCard';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const ClientDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { getCurrentPlan, isActiveSubscription } = useStripe();
  const { tasks, loading, updateTask } = useTasks(userProfile?.id); // Use user ID as client ID for client role
  const [submissions, setSubmissions] = useState<any[]>([]);

  const currentPlan = getCurrentPlan();
  const hasActiveSubscription = isActiveSubscription();

  const handleTaskSubmit = async (taskId: string, submission: any) => {
    try {
      const newSubmission = await DatabaseService.createTaskSubmission({
        task_id: taskId,
        client_id: userProfile?.id || '',
        ...submission,
      });

      setSubmissions(prev => [...prev, newSubmission]);
      
      // Update task status
      await updateTask(taskId, { status: 'completed' });
      toast.success('Task submitted successfully');
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { status });
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
  const waitingTasks = tasks.filter(task => task.status === 'waiting');
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Your Onboarding Progress</h1>
        <p className="text-gray-600 mt-1">
          Complete these tasks to get your marketing campaigns up and running
        </p>
        {currentPlan && (
          <div className="mt-2">
            <Badge variant={hasActiveSubscription ? 'success' : 'warning'} size="sm">
              {currentPlan.name.replace('Portplank - ', '')} - {hasActiveSubscription ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>
          <ProgressBar
            value={progressPercentage}
            className="mt-4"
            variant="default"
          />
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-gray-900">{waitingTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h2>
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              submissions={submissions.filter(s => s.task_id === task.id)}
              onSubmit={handleTaskSubmit}
              onUpdateStatus={handleUpdateStatus}
              isClient={true}
            />
          ))}
        </div>
      </div>

      {completedTasks === totalTasks && totalTasks > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="text-center py-6">
            <CheckSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-green-700">
              You've completed all your onboarding tasks. Your marketing campaigns will be set up shortly!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};