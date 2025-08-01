import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Paperclip, AlertCircle } from 'lucide-react';
import { Task, TaskSubmission } from '../../types/database';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskSubmissionForm } from './TaskSubmissionForm';
import { TaskCommunication } from './TaskCommunication';

interface TaskCardProps {
  task: Task;
  submissions?: TaskSubmission[];
  onSubmit: (taskId: string, submission: Partial<TaskSubmission>) => Promise<void>;
  onUpdateStatus: (taskId: string, status: string) => Promise<void>;
  isClient?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  submissions = [],
  onSubmit,
  onUpdateStatus,
  isClient = false,
}) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'waiting':
        return 'warning';
      case 'blocked':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'document_upload':
        return Paperclip;
      case 'account_creation':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const TaskIcon = getTaskTypeIcon(task.task_type);
  const canSubmit = isClient && (task.status === 'pending' || task.status === 'in_progress');
  const isWaiting = task.status === 'waiting';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <TaskIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {task.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {task.estimated_duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimated_duration} minutes</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Badge variant={getStatusVariant(task.status)}>
          {task.status.replace('_', ' ')}
        </Badge>
      </div>

      {isWaiting && task.wait_message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">{task.wait_message}</span>
          </div>
          {task.wait_until && (
            <div className="text-xs text-yellow-600 mt-1">
              Waiting until: {new Date(task.wait_until).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {task.instructions && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Instructions</h4>
          <p className="text-sm text-gray-600">{task.instructions}</p>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Submissions</h4>
          <div className="space-y-2">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {submission.submission_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </span>
                </div>
                {submission.content && (
                  <p className="text-sm text-gray-600 mt-1">{submission.content}</p>
                )}
                {submission.file_name && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Paperclip className="w-3 h-3 text-gray-400" />
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {submission.file_name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={MessageSquare}
            onClick={() => setShowCommunication(!showCommunication)}
          >
            Messages
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {canSubmit && (
            <Button
              size="sm"
              onClick={() => setShowSubmissionForm(!showSubmissionForm)}
            >
              Submit Work
            </Button>
          )}
          {!isClient && task.status !== 'completed' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateStatus(task.id, 'completed')}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {showSubmissionForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TaskSubmissionForm
            task={task}
            onSubmit={(submission) => {
              onSubmit(task.id, submission);
              setShowSubmissionForm(false);
            }}
            onCancel={() => setShowSubmissionForm(false)}
          />
        </div>
      )}

      {showCommunication && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TaskCommunication taskId={task.id} />
        </div>
      )}
    </Card>
  );
};