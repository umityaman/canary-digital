import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import DocumentService from '../services/DocumentService';
import FileStorageService from '../services/FileStorageService';
import { AuthRequest } from '../types/auth';
import path from 'path';
import fs from 'fs';

const router = Router();
const documentService = new DocumentService();
const fileStorageService = new FileStorageService();

// Configure multer for file uploads
const upload = multer(fileStorageService.getMulterConfig());

// Apply authentication to all routes
router.use(authenticateToken);

// Upload single or multiple documents
router.post('/upload', upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { categoryId, description, tags, parentDocumentId } = req.body;
    const userId = req.user!.id;
    const companyId = req.user!.companyId!;

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : tags;
      }
    }

    const uploadedDocuments = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Validate file
        const validation = fileStorageService.validateFile(file);
        if (!validation.isValid) {
          errors.push({
            filename: file.originalname,
            error: validation.error
          });
          continue;
        }

        // Upload document
        const document = await documentService.uploadDocument(
          {
            originalName: file.originalname,
            mimeType: file.mimetype,
            buffer: file.buffer,
            size: file.size
          },
          userId,
          companyId,
          {
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            description,
            tags: parsedTags,
            parentDocumentId: parentDocumentId ? parseInt(parentDocumentId) : undefined
          }
        );

        uploadedDocuments.push(document);
      } catch (error) {
        console.error('Upload error for file:', file.originalname, error);
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        uploaded: uploadedDocuments,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `${uploadedDocuments.length} file(s) uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents'
    });
  }
});

// Get documents with search and filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const {
      query,
      categoryId,
      tags,
      uploadedById,
      mimeType,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Parse parameters
    const searchOptions = {
      query: query as string,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
      uploadedById: uploadedById ? parseInt(uploadedById as string) : undefined,
      mimeType: mimeType as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'name' | 'createdAt' | 'fileSize' | 'updatedAt',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await documentService.getDocuments(companyId, searchOptions);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
});

// Get single document by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const userId = req.user!.id;

    const document = await documentService.getDocumentById(documentId, companyId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document'
    });
  }
});

// Download document
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const userId = req.user!.id;

    // Check access permissions
    const document = await documentService.getDocumentById(documentId, companyId, userId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      });
    }

    // Get file path
    const filePath = await documentService.getDocumentFilePath(documentId, companyId);
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize.toString());

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// Update document metadata
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const userId = req.user!.id;
    const { name, description, tags, categoryId } = req.body;

    const document = await documentService.updateDocument(
      documentId,
      companyId,
      userId,
      {
        name,
        description,
        tags,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Update document error:', error);
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
});

// Delete document
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const userId = req.user!.id;

    const success = await documentService.deleteDocument(documentId, companyId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// Share document with user
router.post('/:id/share', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const sharedByUserId = req.user!.id;
    const { sharedWithUserId, permission = 'read', expiresAt } = req.body;

    if (!sharedWithUserId) {
      return res.status(400).json({
        success: false,
        message: 'sharedWithUserId is required'
      });
    }

    const share = await documentService.shareDocument(
      documentId,
      companyId,
      sharedByUserId,
      parseInt(sharedWithUserId),
      permission,
      expiresAt ? new Date(expiresAt) : undefined
    );

    res.status(200).json({
      success: true,
      data: share,
      message: 'Document shared successfully'
    });

  } catch (error) {
    console.error('Share document error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to share document'
    });
  }
});

// Remove document share
router.delete('/:id/share/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const sharedWithUserId = parseInt(req.params.userId);
    const companyId = req.user!.companyId!;
    const sharedByUserId = req.user!.id;

    const success = await documentService.removeDocumentShare(
      documentId,
      companyId,
      sharedByUserId,
      sharedWithUserId
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Document or share not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document share removed successfully'
    });

  } catch (error) {
    console.error('Remove document share error:', error);
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to remove document share'
    });
  }
});

// Get document categories
router.get('/categories/list', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const categories = await documentService.getCategories(companyId);

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
});

// Create document category
router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const { name, description, icon, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await documentService.createCategory(companyId, {
      name,
      description,
      icon,
      parentId: parentId ? parseInt(parentId) : undefined
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Update document category
router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;
    const { name, description, icon } = req.body;

    const category = await documentService.updateCategory(categoryId, companyId, {
      name,
      description,
      icon
    });

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete document category
router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const companyId = req.user!.companyId!;

    const success = await documentService.deleteCategory(categoryId, companyId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    if (error instanceof Error && error.message.includes('Cannot delete category')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

// Get document statistics
router.get('/stats/overview', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const stats = await documentService.getDocumentStats(companyId);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document statistics'
    });
  }
});

// Get storage statistics
router.get('/stats/storage', async (req: AuthRequest, res: Response) => {
  try {
    const storageStats = await fileStorageService.getStorageStats();

    res.status(200).json({
      success: true,
      data: storageStats
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage statistics'
    });
  }
});

export default router;