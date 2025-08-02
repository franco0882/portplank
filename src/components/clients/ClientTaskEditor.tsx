import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, GripVertical, Plus, Trash2, Save, Eye, Layout, Monitor, Sidebar, BarChart3, CheckSquare, Users } from 'lucide-react';
import { Task, TaskType } from '../../types/database';
import { useClients, useTasks } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface DraggableTaskProps {
  task: Task;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}) => {
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

  const getTaskTypeColor = (taskType: TaskType) => {
    switch (taskType) {
      case 'account_creation':
        return 'bg-blue-50 text-blue-600';
      case 'document_upload':
        return 'bg-green-50 text-green-600';
      case 'manual_task':
        return 'bg-purple-50 text-purple-600';
      case 'form_completion':
        return 'bg-orange-50 text-orange-600';
      case 'video_recording':
        return 'bg-red-50 text-red-600';
      case 'meeting_scheduling':
        return 'bg-yellow-50 text-yellow-600';
      case 'review_approval':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-move"
    >
      <div className="flex items-start space-x-3">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
            {index + 1}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
            <div className="flex items-center space-x-2 ml-2">
              <Badge variant={getStatusVariant(task.status)} size="sm">
                {task.status.replace('_', ' ')}
              </Badge>
              {task.required && (
                <Badge variant="warning" size="sm">Required</Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                {task.task_type.replace('_', ' ')}
              </span>
              {task.estimated_duration && (
                <span className="text-xs text-gray-500">
                  {task.estimated_duration} min
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="p-1"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LayoutSelectorProps {
  selectedLayout: 'task' | 'dashboard' | 'hybrid';
  onSelectLayout: (layout: 'task' | 'dashboard' | 'hybrid') => void;
  onCancel: () => void;
  clientName: string;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onSelectLayout,
  onCancel,
  clientName,
}) => {
  const layouts = [
    {
      id: 'task' as const,
      name: 'Task Mode',
      description: 'Focus on task completion with progress tracking',
      icon: CheckSquare,
      preview: (
        <div className="bg-white border border-gray-200 rounded-lg p-4 h-48 overflow-hidden">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Welcome back, {clientName}!</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
              <span className="text-sm">✓ Create Facebook Account</span>
              <span className="text-xs bg-green-100 px-2 py-1 rounded">Done</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm">📄 Upload Brand Assets</span>
              <span className="text-xs bg-blue-100 px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
              <span className="text-sm">🎥 Record Intro Video</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pending</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard' as const,
      name: 'Dashboard Mode',
      description: 'Marketing analytics and campaign performance focus',
      icon: BarChart3,
      preview: (
        <div className="bg-white border border-gray-200 rounded-lg p-4 h-48 overflow-hidden">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">{clientName}'s Campaign Dashboard</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="text-lg font-bold text-blue-600">1,247</div>
              <div className="text-xs text-blue-600">Impressions</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="text-lg font-bold text-green-600">23</div>
              <div className="text-xs text-green-600">Conversions</div>
            </div>
          </div>
          <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">📊 Campaign Performance Chart</span>
          </div>
        </div>
      ),
    },
    {
      id: 'hybrid' as const,
      name: 'Hybrid Mode',
      description: 'Tasks sidebar with dashboard taking most of the screen',
      icon: Sidebar,
      preview: (
        <div className="bg-white border border-gray-200 rounded-lg p-2 h-48 overflow-hidden flex">
          <div className="w-1/3 border-r border-gray-200 pr-2">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Tasks</h4>
            <div className="space-y-1">
              <div className="p-1 bg-green-50 rounded text-xs">✓ Account Setup</div>
              <div className="p-1 bg-blue-50 rounded text-xs">📄 Upload Files</div>
              <div className="p-1 bg-gray-50 rounded text-xs">🎥 Record Video</div>
            </div>
          </div>
          <div className="flex-1 pl-2">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Campaign Dashboard</h4>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div className="bg-blue-50 p-1 rounded text-center">
                <div className="text-sm font-bold text-blue-600">1,247</div>
                <div className="text-xs text-blue-600">Views</div>
              </div>
              <div className="bg-green-50 p-1 rounded text-center">
                <div className="text-sm font-bold text-green-600">23</div>
                <div className="text-xs text-green-600">Clicks</div>
              </div>
            </div>
            <div className="bg-gray-100 h-12 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">📊 Analytics</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Choose Dashboard Layout</h3>
          <p className="text-sm text-gray-600">Select how {clientName} will see their dashboard</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {layouts.map((layout) => {
          const Icon = layout.icon;
          const isSelected = selectedLayout === layout.id;
          
          return (
            <div
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className={`cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {layout.name}
                    </h4>
                    {isSelected && (
                      <Badge variant="info" size="sm" className="mt-1">Selected</Badge>
                    )}
                  </div>
                </div>
                
                <p className={`text-sm mb-4 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                  {layout.description}
                </p>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {layout.preview}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
        <div className="text-sm text-gray-600">
          Current selection: <span className="font-medium">{layouts.find(l => l.id === selectedLayout)?.name}</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSelectLayout(selectedLayout)}>
            Apply Layout
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const ClientTaskEditor: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients, loading: clientsLoading } = useClients();
  const { tasks, loading: tasksLoading, createTask, updateTask } = useTasks();
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'task' | 'dashboard' | 'hybrid'>('task');
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);

  const client = clients.find(c => c.id === clientId);
  const loading = clientsLoading || tasksLoading;

  useEffect(() => {
    if (tasks && clientId) {
      const filteredTasks = tasks
        .filter(task => task.client_id === clientId)
        .sort((a, b) => a.order_index - b.order_index);
      setClientTasks(filteredTasks);
    }
  }, [tasks, clientId]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newTasks = [...clientTasks];
    const draggedTask = newTasks[draggedIndex];
    
    // Remove the dragged task
    newTasks.splice(draggedIndex, 1);
    
    // Insert at new position
    newTasks.splice(dropIndex, 0, draggedTask);
    
    // Update order indices
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      order_index: index + 1,
    }));
    
    setClientTasks(updatedTasks);
    setHasUnsavedChanges(true);
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    try {
      // Update all task orders
      for (const task of clientTasks) {
        await updateTask(task.id, { order_index: task.order_index });
      }
      setHasUnsavedChanges(false);
      toast.success('Task order saved successfully');
    } catch (error) {
      toast.error('Failed to save task order');
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!clientId) return;
    
    try {
      const newTask = await createTask({
        ...taskData,
        client_id: clientId,
        order_index: clientTasks.length + 1,
      });
      setClientTasks(prev => [...prev, newTask]);
      setShowAddTask(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setClientTasks(prev => prev.filter(task => task.id !== taskId));
      setHasUnsavedChanges(true);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Client not found</h2>
        <Link to="/dashboard/clients">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
            <p className="text-gray-600">
              {client.company_name && `${client.company_name} • `}
              Dashboard Editor
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setShowLayoutSelector(true)}>
            <Layout className="w-4 h-4 mr-2" />
            Layout: {selectedLayout === 'task' ? 'Task Mode' : selectedLayout === 'dashboard' ? 'Dashboard Mode' : 'Hybrid'}
          </Button>
          {hasUnsavedChanges && (
            <Button variant="secondary" onClick={handleSaveOrder}>
              <Save className="w-4 h-4 mr-2" />
              Save Order
            </Button>
          )}
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-900">{client.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Badge variant={client.status === 'completed' ? 'success' : 'info'}>
              {client.status}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
            <p className="text-sm text-gray-900">
              {clientTasks.filter(t => t.status === 'completed').length} of {clientTasks.length} tasks completed
            </p>
          </div>
        </div>
      </Card>

      {/* Layout Selector */}
      {showLayoutSelector && (
        <LayoutSelector
          selectedLayout={selectedLayout}
          onSelectLayout={(layout) => {
            setSelectedLayout(layout);
            setShowLayoutSelector(false);
            toast.success(`Layout changed to ${layout === 'task' ? 'Task Mode' : layout === 'dashboard' ? 'Dashboard Mode' : 'Hybrid Mode'}`);
          }}
          onCancel={() => setShowLayoutSelector(false)}
          clientName={client.full_name}
        />
      )}

      {!showLayoutSelector && (
        <Card className="bg-gray-50 border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Layout className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Current Layout: {selectedLayout === 'task' ? 'Task Mode' : selectedLayout === 'dashboard' ? 'Dashboard Mode' : 'Hybrid Mode'}</h3>
              <p className="text-sm text-gray-700">
                {selectedLayout === 'task' && 'Client sees only their task list and progress'}
                {selectedLayout === 'dashboard' && 'Client sees marketing campaign statistics and analytics'}
                {selectedLayout === 'hybrid' && 'Client sees tasks in sidebar with dashboard covering most of the screen'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Task Form */}
      {showAddTask && !showLayoutSelector && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
          <TaskForm
            onSave={handleAddTask}
            onCancel={() => setShowAddTask(false)}
          />
        </Card>
      )}

      {/* Task List */}
      {!showLayoutSelector && (
        <div className="space-y-3">
          {clientTasks.map((task, index) => (
            <DraggableTask
              key={task.id}
              task={task}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {clientTasks.length === 0 && !showLayoutSelector && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-4">
            Add tasks to create a customized onboarding experience for {client.full_name}
          </p>
          <Button onClick={() => setShowAddTask(true)}>
            Add First Task
          </Button>
        </Card>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTask(null)}
              >
                ×
              </Button>
            </div>
            <TaskForm
              task={editingTask}
              onSave={async (updates) => {
                await updateTask(editingTask.id, updates);
                setEditingTask(null);
                // Refresh tasks
                const updatedTasks = clientTasks.map(t => 
                  t.id === editingTask.id ? { ...t, ...updates } : t
                );
                setClientTasks(updatedTasks);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export interface TaskFormProps {
  task?: Task;
  onSave: (taskData: Partial<Task>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    task_type: task?.task_type || 'manual_task' as TaskType,
    required: task?.required ?? true,
    estimated_duration: task?.estimated_duration || 30,
    instructions: task?.instructions || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
  });

  const taskTypes: { value: TaskType; label: string; description: string }[] = [
    { 
      value: 'account_creation', 
      label: 'Account Creation', 
      description: 'Client needs to create an account on an external platform' 
    },
    { 
      value: 'document_upload', 
      label: 'Document Upload', 
      description: 'Client needs to upload files or documents' 
    },
    { 
      value: 'manual_task', 
      label: 'Manual Task', 
      description: 'General task that requires manual completion' 
    },
    { 
      value: 'form_completion', 
      label: 'Form Completion', 
      description: 'Client needs to fill out a form or questionnaire' 
    },
    { 
      value: 'video_recording', 
      label: 'Video Recording', 
      description: 'Client needs to record and submit a video' 
    },
    { 
      value: 'meeting_scheduling', 
      label: 'Meeting Scheduling', 
      description: 'Client needs to schedule a meeting or call' 
    },
    { 
      value: 'review_approval', 
      label: 'Review & Approval', 
      description: 'Client needs to review and approve something' 
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create Facebook Business Account"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type *
          </label>
          <select
            value={formData.task_type}
            onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value as TaskType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {taskTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {taskTypes.find(t => t.value === formData.task_type)?.description}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what the client needs to accomplish..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Provide detailed step-by-step instructions for the client..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.estimated_duration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            placeholder="30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Required task</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};