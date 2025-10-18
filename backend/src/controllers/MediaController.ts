import { Request, Response } from 'express';
import MediaService from '../services/MediaService';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads/media');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow all common file types
    const allowedMimeTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

class MediaController {
  // Multer middleware for routes
  uploadSingle = upload.single('file');
  uploadMultiple = upload.array('files', 20); // Max 20 files

  /**
   * Upload single media file
   * POST /api/cms/media/upload
   */
  async uploadMedia(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const uploadedById = (req as any).user.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileData = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        path: req.file.path
      };

      const media = await MediaService.uploadMedia(companyId, uploadedById, {
        file: fileData,
        title: req.body.title,
        altText: req.body.altText,
        caption: req.body.caption,
        description: req.body.description,
        folderId: req.body.folderId ? parseInt(req.body.folderId) : undefined,
        tags: req.body.tags ? JSON.parse(req.body.tags) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: media
      });
    } catch (error: any) {
      console.error('Error uploading media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload file'
      });
    }
  }

  /**
   * Upload multiple media files
   * POST /api/cms/media/upload/multiple
   */
  async uploadMultipleMedia(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const uploadedById = (req as any).user.userId;

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const filesData = (req.files as Express.Multer.File[]).map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
        path: file.path
      }));

      const folderId = req.body.folderId ? parseInt(req.body.folderId) : undefined;

      const result = await MediaService.uploadMultiple(
        companyId,
        uploadedById,
        filesData,
        folderId
      );

      res.status(201).json({
        success: true,
        message: `${result.successful.length} files uploaded successfully`,
        data: {
          successful: result.successful,
          failed: result.failed
        }
      });
    } catch (error: any) {
      console.error('Error uploading multiple media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload files'
      });
    }
  }

  /**
   * Get media file by ID
   * GET /api/cms/media/:id
   */
  async getMediaById(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const mediaId = parseInt(req.params.id);

      const media = await MediaService.getMediaById(mediaId, companyId);

      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media file not found'
        });
      }

      res.json({
        success: true,
        data: media
      });
    } catch (error: any) {
      console.error('Error getting media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get media file'
      });
    }
  }

  /**
   * List media files
   * GET /api/cms/media
   */
  async listMedia(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filters: any = {};

      if (req.query.type) filters.type = req.query.type;
      if (req.query.search) filters.search = req.query.search;
      if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';
      if (req.query.uploadedById) filters.uploadedById = parseInt(req.query.uploadedById as string);
      
      if (req.query.folderId !== undefined) {
        filters.folderId = req.query.folderId === 'null' ? null : parseInt(req.query.folderId as string);
      }

      const result = await MediaService.listMedia(companyId, filters, page, limit);

      res.json({
        success: true,
        data: result.files,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      console.error('Error listing media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list media files'
      });
    }
  }

  /**
   * Update media file metadata
   * PUT /api/cms/media/:id
   */
  async updateMedia(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const mediaId = parseInt(req.params.id);

      const media = await MediaService.updateMedia(mediaId, companyId, req.body);

      res.json({
        success: true,
        message: 'Media file updated successfully',
        data: media
      });
    } catch (error: any) {
      console.error('Error updating media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update media file'
      });
    }
  }

  /**
   * Delete media file
   * DELETE /api/cms/media/:id
   */
  async deleteMedia(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const mediaId = parseInt(req.params.id);

      const result = await MediaService.deleteMedia(mediaId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete media file'
      });
    }
  }

  /**
   * Delete multiple media files
   * DELETE /api/cms/media/bulk
   */
  async deleteMultiple(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { mediaIds } = req.body;

      if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'mediaIds array is required'
        });
      }

      const result = await MediaService.deleteMultiple(companyId, mediaIds);

      res.json({
        success: true,
        message: `${result.successful} files deleted successfully`,
        data: result
      });
    } catch (error: any) {
      console.error('Error deleting multiple media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete media files'
      });
    }
  }

  // ============================================
  // FOLDER MANAGEMENT
  // ============================================

  /**
   * Create folder
   * POST /api/cms/media/folders
   */
  async createFolder(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const folder = await MediaService.createFolder(companyId, req.body);

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: folder
      });
    } catch (error: any) {
      console.error('Error creating folder:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create folder'
      });
    }
  }

  /**
   * List folders
   * GET /api/cms/media/folders
   */
  async listFolders(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const parentId = req.query.parentId 
        ? (req.query.parentId === 'null' ? null : parseInt(req.query.parentId as string))
        : undefined;

      const folders = await MediaService.listFolders(companyId, parentId);

      res.json({
        success: true,
        data: folders
      });
    } catch (error: any) {
      console.error('Error listing folders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list folders'
      });
    }
  }

  /**
   * Get folder hierarchy
   * GET /api/cms/media/folders/hierarchy
   */
  async getFolderHierarchy(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const hierarchy = await MediaService.getFolderHierarchy(companyId);

      res.json({
        success: true,
        data: hierarchy
      });
    } catch (error: any) {
      console.error('Error getting folder hierarchy:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get folder hierarchy'
      });
    }
  }

  /**
   * Update folder
   * PUT /api/cms/media/folders/:id
   */
  async updateFolder(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const folderId = parseInt(req.params.id);

      const folder = await MediaService.updateFolder(folderId, companyId, req.body);

      res.json({
        success: true,
        message: 'Folder updated successfully',
        data: folder
      });
    } catch (error: any) {
      console.error('Error updating folder:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update folder'
      });
    }
  }

  /**
   * Delete folder
   * DELETE /api/cms/media/folders/:id
   */
  async deleteFolder(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const folderId = parseInt(req.params.id);

      const result = await MediaService.deleteFolder(folderId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete folder'
      });
    }
  }

  /**
   * Move files to folder
   * POST /api/cms/media/move
   */
  async moveFilesToFolder(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { fileIds, folderId } = req.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'fileIds array is required'
        });
      }

      const result = await MediaService.moveFilesToFolder(
        companyId,
        fileIds,
        folderId || null
      );

      res.json({
        success: true,
        message: `${result.moved} files moved successfully`,
        data: result
      });
    } catch (error: any) {
      console.error('Error moving files:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to move files'
      });
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get media statistics
   * GET /api/cms/media/statistics
   */
  async getMediaStatistics(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const stats = await MediaService.getMediaStatistics(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting media statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get media statistics'
      });
    }
  }
}

export default new MediaController();
