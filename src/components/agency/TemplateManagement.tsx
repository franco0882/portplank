import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Copy, BookTemplate as FileTemplate } from 'lucide-react';
import { TemplateTask, TaskType } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useTemplates, useTasks } from '../../hooks/useDatabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import toast from 'react-hot-toast';

export const TemplateManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { tasks: allTasks, loading: tasksLoading } = useTasks();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter to get only custom tasks (tasks without template_task_id)
  const availableTasks = allTasks.filter(task => !task.template_task_id);

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

  if (loading || tasksLoading) {
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
            availableTasks={availableTasks}
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
  availableTasks: any[];
  onSave: (template: Partial<Template>) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, availableTasks, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    is_active: template?.is_active ?? true,
    tasks: template?.tasks || [],
  });

  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddTask = (selectedTask: any) => {
    // Convert the selected task to a template task
    const templateTask: TemplateTask = {
      id: selectedTask.id,
      title: selectedTask.title,
      description: selectedTask.description,
      task_type: selectedTask.task_type,
      order_index: formData.tasks.length + 1,
      required: true,
      estimated_duration: selectedTask.estimated_duration,
      instructions: selectedTask.instructions,
      metadata: selectedTask.metadata || {},
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, templateTask],
    }));
    setShowTaskSelector(false);
  };

  const handleRemoveTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
  };

  // Filter out tasks that are already in the template
  const availableTasksToAdd = availableTasks.filter(task => 
    !formData.tasks.some(templateTask => templateTask.id === task.id)
  );

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
            onClick={() => setShowTaskSelector(true)}
            disabled={availableTasksToAdd.length === 0}
          >
            Add Task
          </Button>
          {availableTasksToAdd.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No available tasks. Create custom tasks on the Tasks page first.
            </p>
          )}
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
              onClick={() => setShowTaskSelector(true)}
              className="mt-2"
              disabled={availableTasksToAdd.length === 0}
            >
              {availableTasksToAdd.length === 0 ? 'Create tasks on Tasks page first' : 'Add your first task'}
            </Button>
          </div>
        )}

        {/* Task Selector */}
        {showTaskSelector && (
          <Card className="mt-4">
            <h5 className="font-medium text-gray-900 mb-4">Select Task to Add</h5>
            <TaskSelector
              availableTasks={availableTasksToAdd}
              onSelect={handleAddTask}
              onCancel={() => setShowTaskSelector(false)}
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

interface TaskSelectorProps {
  availableTasks: any[];
  onSelect: (task: any) => void;
  onCancel: () => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ availableTasks, onSelect, onCancel }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = availableTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTask = availableTasks.find(task => task.id === selectedTaskId);
    if (selectedTask) {
      onSelect(selectedTask);
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

    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Tasks
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by task name or description..."
        />
      </div>

      {/* Task List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Tasks ({filteredTasks.length})
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
          {filteredTasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No tasks match your search' : 'No custom tasks available. Create tasks on the Tasks page first.'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredTasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTaskId === task.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedTask"
                    value={task.id}
                    checked={selectedTaskId === task.id}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                        {task.task_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      {task.estimated_duration && (
                        <span>{task.estimated_duration} min</span>
                      )}
                      {task.metadata?.webhook_url && (
                        <Badge variant="info" size="sm">Webhook</Badge>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Task Preview */}
      {selectedTaskId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h6 className="font-medium text-blue-900 mb-2">Selected Task Preview:</h6>
          {(() => {
            const selectedTask = availableTasks.find(t => t.id === selectedTaskId);
            return selectedTask ? (
              <div>
                <p className="text-sm font-medium text-blue-800">{selectedTask.title}</p>
                <p className="text-sm text-blue-700 mt-1">{selectedTask.description}</p>
                {selectedTask.instructions && (
                  <p className="text-xs text-blue-600 mt-2">
                    <strong>Instructions:</strong> {selectedTask.instructions}
                  </p>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedTaskId}>
          Add Task
        </Button>
      </form>
    </div>
  );
};