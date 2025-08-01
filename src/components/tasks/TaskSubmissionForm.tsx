import React, { useState } from 'react';
import { Upload, Link, FileText, CheckCircle } from 'lucide-react';
import { Task, TaskSubmission } from '../../types/database';
import { FileUploadService } from '../../lib/fileUpload';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface TaskSubmissionFormProps {
  task: Task;
  onSubmit: (submission: Partial<TaskSubmission>) => void;
  onCancel: () => void;
}

export const TaskSubmissionForm: React.FC<TaskSubmissionFormProps> = ({
  task,
  onSubmit,
  onCancel,
}) => {
  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'link' | 'account_created'>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submission: Partial<TaskSubmission> = {
        submission_type: submissionType,
        content: submissionType === 'text' || submissionType === 'link' ? content : undefined,
      };

      if (file && submissionType === 'file') {
        const validation = FileUploadService.validateFile(file);
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid file');
          return;
        }

        const uploadResult = await FileUploadService.uploadTaskFile(file, task.id, task.client_id);
        submission.file_name = file.name;
        submission.file_size = file.size;
        submission.file_url = uploadResult.url;
      }

      if (submissionType === 'account_created') {
        submission.metadata = { account_created: true };
      }

      onSubmit(submission);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
    } finally {
      setUploading(false);
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return Upload;
      case 'link':
        return Link;
      case 'account_created':
        return CheckCircle;
      default:
        return FileText;
    }
  };

  const submissionTypes = [
    { value: 'text', label: 'Text Response', icon: FileText },
    { value: 'file', label: 'File Upload', icon: Upload },
    { value: 'link', label: 'Link/URL', icon: Link },
  ];

  if (task.task_type === 'account_creation') {
    submissionTypes.push({ value: 'account_created', label: 'Account Created', icon: CheckCircle });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-medium text-gray-900">Submit Your Work</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Submission Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {submissionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSubmissionType(type.value as any)}
                className={`flex items-center space-x-2 p-3 rounded-lg border text-sm ${
                  submissionType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {submissionType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you've completed..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      )}

      {submissionType === 'link' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL
          </label>
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      )}

      {submissionType === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drop your file here or click to browse
            </p>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,video/*"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({FileUploadService.formatFileSize(file.size)})
              </p>
            )}
          </div>
        </div>
      )}

      {submissionType === 'account_created' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              I have successfully created the required account
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Submitting this will mark the account creation as complete.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={uploading}
          disabled={
            (submissionType === 'text' && !content.trim()) ||
            (submissionType === 'link' && !content.trim()) ||
            (submissionType === 'file' && !file)
          }
        >
          Submit
        </Button>
      </div>
    </form>
  );
};