import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import multer from 'multer';
import crypto from 'crypto';

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export interface StorageOptions {
  uploadPath: string;
  createThumbnails: boolean;
  preserveOriginalName: boolean;
}

export class FileStorageService {
  private uploadPath: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];
  private allowedExtensions: string[];

  constructor(options: {
    uploadPath?: string;
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    allowedExtensions?: string[];
  } = {}) {
    this.uploadPath = options.uploadPath || './uploads/documents';
    this.maxFileSize = options.maxFileSize || 100 * 1024 * 1024; // 100MB default
    this.allowedMimeTypes = options.allowedMimeTypes || [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf',
      
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm'
    ];
    
    this.allowedExtensions = options.allowedExtensions || [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.csv', '.rtf',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff',
      '.zip', '.rar', '.7z', '.gz',
      '.mp4', '.mpeg', '.mov', '.avi', '.webm',
      '.mp3', '.wav', '.ogg'
    ];

    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      await access(this.uploadPath);
    } catch {
      await mkdir(this.uploadPath, { recursive: true });
    }

    // Create subdirectories for organization
    const subdirs = ['documents', 'images', 'archives', 'videos', 'audio', 'temp'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(this.uploadPath, subdir);
      try {
        await access(subdirPath);
      } catch {
        await mkdir(subdirPath, { recursive: true });
      }
    }
  }

  // Configure multer middleware
  getMulterConfig(): multer.Options {
    const storage = multer.memoryStorage(); // Store in memory for processing

    return {
      storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Max 10 files per upload
      },
      fileFilter: (req, file, cb) => {
        const isValidMimeType = this.allowedMimeTypes.includes(file.mimetype);
        const ext = path.extname(file.originalname).toLowerCase();
        const isValidExtension = this.allowedExtensions.includes(ext);

        if (isValidMimeType && isValidExtension) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`));
        }
      }
    };
  }

  // Generate secure filename
  generateSecureFileName(originalName: string, userId: number): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('md5')
      .update(`${userId}-${originalName}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    
    return `${userId}_${timestamp}_${hash}_${random}${ext}`;
  }

  // Get file category based on mime type
  getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('gzip')) {
      return 'archives';
    }
    return 'documents';
  }

  // Save file to storage
  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: number
  ): Promise<{
    fileName: string;
    filePath: string;
    fileSize: number;
  }> {
    const fileName = this.generateSecureFileName(originalName, userId);
    const category = this.getFileCategory(mimeType);
    const relativePath = path.join(category, fileName);
    const fullPath = path.join(this.uploadPath, relativePath);

    // Ensure category directory exists
    const categoryDir = path.join(this.uploadPath, category);
    try {
      await access(categoryDir);
    } catch {
      await mkdir(categoryDir, { recursive: true });
    }

    // Write file
    await fs.promises.writeFile(fullPath, buffer);

    return {
      fileName: relativePath, // Store relative path
      filePath: fullPath,    // Full path for immediate use
      fileSize: buffer.length
    };
  }

  // Get file path
  getFilePath(fileName: string): string {
    return path.join(this.uploadPath, fileName);
  }

  // Check if file exists
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await access(this.getFilePath(fileName));
      return true;
    } catch {
      return false;
    }
  }

  // Delete file
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(fileName);
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file stats
  async getFileStats(fileName: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  } | null> {
    try {
      const filePath = this.getFilePath(fileName);
      const stats = await stat(filePath);
      
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch {
      return null;
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    sizeByCategory: { [category: string]: number };
    filesByCategory: { [category: string]: number };
  }> {
    const categories = ['documents', 'images', 'archives', 'videos', 'audio'];
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      sizeByCategory: {} as { [category: string]: number },
      filesByCategory: {} as { [category: string]: number }
    };

    for (const category of categories) {
      const categoryPath = path.join(this.uploadPath, category);
      try {
        const files = await readdir(categoryPath);
        stats.filesByCategory[category] = files.length;
        stats.totalFiles += files.length;

        let categorySize = 0;
        for (const file of files) {
          try {
            const filePath = path.join(categoryPath, file);
            const fileStat = await stat(filePath);
            categorySize += fileStat.size;
          } catch (error) {
            // Skip inaccessible files
            console.warn(`Cannot access file: ${file}`, error);
          }
        }
        
        stats.sizeByCategory[category] = categorySize;
        stats.totalSize += categorySize;
      } catch (error) {
        // Category directory doesn't exist or is inaccessible
        stats.filesByCategory[category] = 0;
        stats.sizeByCategory[category] = 0;
      }
    }

    return stats;
  }

  // Validate file before upload
  validateFile(file: Express.Multer.File): {
    isValid: boolean;
    error?: string;
  } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${Math.round(this.maxFileSize / 1024 / 1024)}MB`
      };
    }

    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type '${file.mimetype}' is not allowed`
      };
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      return {
        isValid: false,
        error: `File extension '${ext}' is not allowed`
      };
    }

    // Additional security checks
    if (this.containsSuspiciousContent(file.originalname)) {
      return {
        isValid: false,
        error: 'File name contains suspicious content'
      };
    }

    return { isValid: true };
  }

  // Security check for file names
  private containsSuspiciousContent(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /\.exe$/i,        // Executable files
      /\.bat$/i,        // Batch files
      /\.cmd$/i,        // Command files
      /\.scr$/i,        // Screen saver files
      /\.vbs$/i,        // VBScript files
      /\.js$/i,         // JavaScript files (if not explicitly allowed)
      /\.php$/i,        // PHP files
      /\.asp$/i,        // ASP files
      /\.jsp$/i         // JSP files
    ];

    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  // Clean up old temporary files
  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    const tempDir = path.join(this.uploadPath, 'temp');
    let deletedCount = 0;

    try {
      const files = await readdir(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        try {
          const filePath = path.join(tempDir, file);
          const stats = await stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await unlink(filePath);
            deletedCount++;
          }
        } catch (error) {
          console.warn(`Failed to process temp file: ${file}`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }

    return deletedCount;
  }

  // Get human readable file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on extension
  static getFileIcon(mimeType: string, fileName?: string): string {
    // Document types
    if (mimeType === 'application/pdf') return 'file-text';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-spreadsheet';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
    
    // Generic types
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';
    if (mimeType.startsWith('text/')) return 'file-text';
    
    return 'file';
  }
}

export default FileStorageService;