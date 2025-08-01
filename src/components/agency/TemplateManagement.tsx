import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Copy, BookTemplate as FileTemplate } from 'lucide-react';
import { TemplateTask, TaskType } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useTemplates } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import toast from 'react-hot-toast';

export const TemplateManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await createTemplate(templateData);
      setShowCreateForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const handleUpdateTemplate = async (templateData: any) => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate(editingTemplate.id, templateData);
      setEditingTemplate(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      await createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        tasks: template.tasks,
        is_active: template.is_active,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

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
          <h2 className="text-xl font-semibold text-gray-900">Template Management</h2>
          <p className="text-gray-600 mt-1">
            Create and manage reusable onboarding workflows
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create Template
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Create/Edit Template Form */}
      {(showCreateForm || editingTemplate) && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          <TemplateForm
            template={editingTemplate}
            onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingTemplate(null);
            }}
          />
        </Card>
      )}

      {/* Template List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileTemplate className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{template.tasks.length} tasks</span>
                    <span>
                      {template.tasks.reduce((total, task) => total + (task.estimated_duration || 0), 0)} min total
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={template.is_active ? 'success' : 'warning'}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
                
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    {
                      icon: Edit,
                      label: 'Edit Template',
                      onClick: () => setEditingTemplate(template),
                    },
                    {
                      icon: Copy,
                      label: 'Duplicate',
                      onClick: () => handleDuplicateTemplate(template),
                    },
                    { type: 'separator' },
                    {
                      icon: Trash2,
                      label: 'Delete',
                      onClick: () => handleDeleteTemplate(template.id),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              {template.tasks.slice(0, 3).map((task, index) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.task_type.replace('_', ' ')}</p>
                  </div>
                  {task.required && (
                    <Badge variant="warning" size="sm">Required</Badge>
                  )}
                </div>
              ))}
              
              {template.tasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  +{template.tasks.length - 3} more tasks
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                Edit Tasks
              </Button>
              <span className="text-xs text-gray-500">
                Updated {new Date(template.updated_at).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <FileTemplate className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search'
              : 'Create your first onboarding template to get started'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Template
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

interface TemplateFormProps {
  template?: Template | null;
  onSave: (template: Partial<Template>) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    is_active: template?.is_active ?? true,
    tasks: template?.tasks || [],
  });

  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddTask = (taskData: Partial<TemplateTask>) => {
    const newTask: TemplateTask = {
      id: Date.now().toString(),
      order_index: formData.tasks.length + 1,
      required: true,
      ...taskData,
    } as TemplateTask;

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    setShowTaskForm(false);
  };

  const handleRemoveTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
  };

  const taskTypes: { value: TaskType; label: string }[] = [
    { value: 'account_creation', label: 'Account Creation' },
    { value: 'document_upload', label: 'Document Upload' },
    { value: 'manual_task', label: 'Manual Task' },
    { value: 'form_completion', label: 'Form Completion' },
    { value: 'video_recording', label: 'Video Recording' },
    { value: 'meeting_scheduling', label: 'Meeting Scheduling' },
    { value: 'review_approval', label: 'Review & Approval' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Marketing Onboarding"
            required
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Active template</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what this template is used for..."
        />
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Tasks</h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </Button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {formData.tasks.map((task, index) => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{task.task_type.replace('_', ' ')}</span>
                    {task.estimated_duration && <span>{task.estimated_duration} min</span>}
                    {task.required && <Badge variant="warning" size="sm">Required</Badge>}
                  </div>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTask(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {formData.tasks.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileTemplate className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No tasks added yet</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTaskForm(true)}
              className="mt-2"
            >
              Add your first task
            </Button>
          </div>
        )}

        {/* Add Task Form */}
        {showTaskForm && (
          <Card className="mt-4">
            <h5 className="font-medium text-gray-900 mb-4">Add New Task</h5>
            <TaskForm
              onAdd={handleAddTask}
              onCancel={() => setShowTaskForm(false)}
              taskTypes={taskTypes}
            />
          </Card>
        )}
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

interface TaskFormProps {
  onAdd: (task: Partial<TemplateTask>) => void;
  onCancel: () => void;
  taskTypes: { value: TaskType; label: string }[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onCancel, taskTypes }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    task_type: 'manual_task' as TaskType,
    required: true,
    estimated_duration: 30,
    instructions: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create Facebook Account"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type *
          </label>
          <select
            value={taskData.task_type}
            onChange={(e) => setTaskData(prev => ({ ...prev, task_type: e.target.value as TaskType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {taskTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what the client needs to do..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={taskData.instructions}
          onChange={(e) => setTaskData(prev => ({ ...prev, instructions: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Detailed step-by-step instructions for the client..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={taskData.estimated_duration}
            onChange={(e) => setTaskData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={taskData.required}
              onChange={(e) => setTaskData(prev => ({ ...prev, required: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Required task</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Task
        </Button>
      </div>
    </form>
  );
};