import { supabase } from './supabase';

export class FileUploadService {
  private static readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size must be less than 50MB',
      };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload images, documents, or videos only.',
      };
    }

    return { valid: true };
  }

  static async uploadTaskFile(file: File, taskId: string, clientId: string): Promise<{
    url: string;
    path: string;
  }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `tasks/${taskId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('task-files')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('task-files')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  }

  static async uploadAvatar(file: File, userId: string): Promise<{
    url: string;
    path: string;
  }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Only allow images for avatars
    if (!file.type.startsWith('image/')) {
      throw new Error('Avatar must be an image file');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Delete existing avatar if it exists
    await supabase.storage
      .from('avatars')
      .remove([filePath]);

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  }

  static async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}