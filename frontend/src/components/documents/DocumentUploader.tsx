import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Image,
  FileText,
  Archive,
  Video,
  Music
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  id?: string;
}

interface DocumentUploaderProps {
  onUpload: (files: FileWithPreview[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  categoryId?: number;
  description?: string;
  tags?: string[];
  onFilesChange?: (files: FileWithPreview[]) => void;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'application/zip'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  maxFiles = 10,
  maxSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_TYPES,
  categoryId,
  description,
  tags,
  onFilesChange
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      console.error('File rejected:', rejectedFile.errors);
    }

    // Process accepted files
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => ({
      ...file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending' as const,
      progress: 0,
      id: Math.random().toString(36).substring(2)
    }));

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'audio/mpeg': ['.mp3'],
      'application/zip': ['.zip']
    },
    maxFiles,
    maxSize,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      onFilesChange?.(updated);
      return updated;
    });
  };

  const clearAllFiles = () => {
    // Clean up object URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onFilesChange?.([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      // Update files status to uploading
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'uploading' as const,
        progress: 0
      })));

      await onUpload(files);

      // Update files status to success
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'success' as const,
        progress: 100
      })));

      // Clear files after successful upload
      setTimeout(() => {
        clearAllFiles();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update files status to error
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('zip')) return <Archive className="w-8 h-8 text-yellow-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Dosya Yükleme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-neutral-500 bg-blue-50' 
              : 'border-neutral-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Dosyaları buraya bırakın...</p>
          ) : (
            <div>
              <p className="text-neutral-600 mb-2">
                Dosyaları buraya sürükleyip bırakın veya <span className="text-blue-600 font-medium">seçmek için tıklayın</span>
              </p>
              <p className="text-sm text-gray-500">
                Maksimum {maxFiles} dosya, her biri {formatFileSize(maxSize)} boyutunda
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Desteklenen formatlar: PDF, DOC, XLS, JPG, PNG, MP4, MP3, ZIP
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-900">
                Seçilen Dosyalar ({files.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                disabled={uploading}
              >
                Tümünü Temizle
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-1">
                        <Progress value={file.progress || 0} className="h-1" />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    
                    {file.status === 'success' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Başarılı
                      </Badge>
                    )}
                    
                    {file.status === 'error' && (
                      <Badge variant="destructive">
                        Hata
                      </Badge>
                    )}
                    
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id!)}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearAllFiles}
                disabled={uploading}
              >
                İptal
              </Button>
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="min-w-24"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Yükle
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {files.length > 0 && (
          <div className="text-sm text-neutral-600 bg-blue-50 p-3 rounded">
            <p>
              <strong>{files.length}</strong> dosya seçildi, 
              toplam boyut: <strong>{formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}</strong>
            </p>
            {categoryId && <p>Kategori ID: {categoryId}</p>}
            {description && <p>Açıklama: {description}</p>}
            {tags && tags.length > 0 && (
              <p>Etiketler: {tags.join(', ')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;