import { PrismaClient, Document, DocumentCategory, DocumentShare, User } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import multer from 'multer';

// Sharp is optional - only for thumbnail generation
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not available - thumbnail generation will be disabled');
}

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

export interface DocumentUpload {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export interface DocumentWithDetails extends Document {
  uploadedBy: {
    id: number;
    name: string | null;
    email: string;
  };
  category: DocumentCategory | null;
  shares: (DocumentShare & {
    sharedWithUser: User;
    sharedByUser: User;
  })[];
  versions?: Document[];
}

export interface DocumentSearchOptions {
  query?: string;
  categoryId?: number;
  tags?: string[];
  uploadedById?: number;
  mimeType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'fileSize' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryWithDocuments extends DocumentCategory {
  documents: Document[];
  children: CategoryWithDocuments[];
  _count: {
    documents: number;
  };
}

export class DocumentService {
  private prisma: PrismaClient;
  private uploadPath: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.uploadPath = process.env.DOCUMENT_UPLOAD_PATH || './uploads/documents';
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await access(this.uploadPath);
    } catch {
      await mkdir(this.uploadPath, { recursive: true });
    }
  }

  private generateFileName(originalName: string, userId: number): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${userId}_${timestamp}_${random}${ext}`;
  }

  private async generateThumbnail(filePath: string, mimeType: string): Promise<string | null> {
    if (!mimeType.startsWith('image/')) {
      return null;
    }

    // Sharp is optional - only generate thumbnails if available
    if (!sharp) {
      console.log('Sharp not available - skipping thumbnail generation');
      return null;
    }

    try {
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return null;
    }
  }

  private extractTextFromDocument(filePath: string, mimeType: string): Promise<string> {
    // TODO: Implement text extraction for searchable content
    // For PDF: use pdf-parse
    // For DOC/DOCX: use mammoth
    // For images: use OCR library like tesseract.js
    return Promise.resolve('');
  }

  // Document Upload
  async uploadDocument(
    file: DocumentUpload,
    userId: number,
    companyId: number,
    options: {
      categoryId?: number;
      description?: string;
      tags?: string[];
      parentDocumentId?: number;
    } = {}
  ): Promise<DocumentWithDetails> {
    const fileName = this.generateFileName(file.originalName, userId);
    const filePath = path.join(this.uploadPath, fileName);
    
    // Save file to disk
    await writeFile(filePath, file.buffer);
    
    // Generate thumbnail for images
    const thumbnailPath = await this.generateThumbnail(filePath, file.mimeType);
    
    // Extract text for search indexing
    const extractedText = await this.extractTextFromDocument(filePath, file.mimeType);
    
    // Determine version number
    let version = 1;
    if (options.parentDocumentId) {
      const latestVersion = await this.prisma.document.findFirst({
        where: {
          OR: [
            { id: options.parentDocumentId },
            { parentDocumentId: options.parentDocumentId }
          ]
        },
        orderBy: { version: 'desc' }
      });
      version = (latestVersion?.version || 0) + 1;
    }

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        name: file.originalName,
        originalName: file.originalName,
        filePath: fileName, // Store relative path
        fileSize: BigInt(file.size),
        mimeType: file.mimeType,
        description: options.description,
        tags: options.tags || [],
        version,
        parentDocumentId: options.parentDocumentId,
        categoryId: options.categoryId,
        uploadedById: userId,
        companyId
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        shares: {
          include: {
            sharedWithUser: true,
            sharedByUser: true
          }
        }
      }
    });

    return document;
  }

  // Get Documents with Search and Filtering
  async getDocuments(
    companyId: number,
    options: DocumentSearchOptions = {}
  ): Promise<{
    documents: DocumentWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      query,
      categoryId,
      tags,
      uploadedById,
      mimeType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      companyId,
      isActive: true
    };

    // Text search across name and description
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { originalName: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Additional filters
    if (categoryId) where.categoryId = categoryId;
    if (uploadedById) where.uploadedById = uploadedById;
    if (mimeType) where.mimeType = { contains: mimeType };
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Execute queries
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true }
          },
          category: true,
          shares: {
            include: {
              sharedWithUser: true,
              sharedByUser: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.document.count({ where })
    ]);

    return {
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get Document by ID
  async getDocumentById(
    documentId: number,
    companyId: number,
    userId?: number
  ): Promise<DocumentWithDetails | null> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        companyId,
        isActive: true
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        shares: {
          include: {
            sharedWithUser: true,
            sharedByUser: true
          }
        },
        versions: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Check access permissions
    if (document && userId) {
      const hasAccess = 
        document.uploadedById === userId || // Owner
        document.shares.some(share => share.sharedWithUserId === userId); // Shared

      if (!hasAccess) {
        return null;
      }
    }

    return document;
  }

  // Get Document File Path
  async getDocumentFilePath(documentId: number, companyId: number): Promise<string | null> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        companyId,
        isActive: true
      }
    });

    if (!document) return null;
    
    return path.join(this.uploadPath, document.filePath);
  }

  // Update Document
  async updateDocument(
    documentId: number,
    companyId: number,
    userId: number,
    updates: {
      name?: string;
      description?: string;
      tags?: string[];
      categoryId?: number;
    }
  ): Promise<DocumentWithDetails | null> {
    // Check permissions
    const document = await this.getDocumentById(documentId, companyId, userId);
    if (!document) return null;

    const hasWriteAccess = 
      document.uploadedById === userId || // Owner
      document.shares.some(share => 
        share.sharedWithUserId === userId && 
        ['write', 'admin'].includes(share.permission)
      );

    if (!hasWriteAccess) {
      throw new Error('Insufficient permissions to update document');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: updates,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        shares: {
          include: {
            sharedWithUser: true,
            sharedByUser: true
          }
        }
      }
    });
  }

  // Delete Document
  async deleteDocument(
    documentId: number,
    companyId: number,
    userId: number
  ): Promise<boolean> {
    const document = await this.getDocumentById(documentId, companyId, userId);
    if (!document) return false;

    // Check permissions - only owner or admin can delete
    const hasDeleteAccess = 
      document.uploadedById === userId || // Owner
      document.shares.some(share => 
        share.sharedWithUserId === userId && 
        share.permission === 'admin'
      );

    if (!hasDeleteAccess) {
      throw new Error('Insufficient permissions to delete document');
    }

    // Soft delete (mark as inactive)
    await this.prisma.document.update({
      where: { id: documentId },
      data: { isActive: false }
    });

    // TODO: Optionally delete physical file after grace period
    // For now, keep files for recovery purposes

    return true;
  }

  // Share Document
  async shareDocument(
    documentId: number,
    companyId: number,
    sharedByUserId: number,
    sharedWithUserId: number,
    permission: 'read' | 'write' | 'admin' = 'read',
    expiresAt?: Date
  ): Promise<DocumentShare> {
    // Verify document exists and user has access
    const document = await this.getDocumentById(documentId, companyId, sharedByUserId);
    if (!document) {
      throw new Error('Document not found or access denied');
    }

    // Check if sharing user has admin access
    const hasAdminAccess = 
      document.uploadedById === sharedByUserId || // Owner
      document.shares.some(share => 
        share.sharedWithUserId === sharedByUserId && 
        share.permission === 'admin'
      );

    if (!hasAdminAccess) {
      throw new Error('Insufficient permissions to share document');
    }

    // Create or update share
    return this.prisma.documentShare.upsert({
      where: {
        documentId_sharedWithUserId: {
          documentId,
          sharedWithUserId
        }
      },
      update: {
        permission,
        expiresAt,
        sharedByUserId
      },
      create: {
        documentId,
        sharedWithUserId,
        sharedByUserId,
        permission,
        expiresAt
      }
    });
  }

  // Remove Document Share
  async removeDocumentShare(
    documentId: number,
    companyId: number,
    sharedByUserId: number,
    sharedWithUserId: number
  ): Promise<boolean> {
    // Verify permissions
    const document = await this.getDocumentById(documentId, companyId, sharedByUserId);
    if (!document) return false;

    const hasAdminAccess = 
      document.uploadedById === sharedByUserId ||
      document.shares.some(share => 
        share.sharedWithUserId === sharedByUserId && 
        share.permission === 'admin'
      );

    if (!hasAdminAccess) {
      throw new Error('Insufficient permissions to remove share');
    }

    await this.prisma.documentShare.deleteMany({
      where: {
        documentId,
        sharedWithUserId
      }
    });

    return true;
  }

  // Categories Management
  async getCategories(companyId: number): Promise<CategoryWithDocuments[]> {
    return this.prisma.documentCategory.findMany({
      where: { 
        companyId,
        parentId: null // Get root categories
      },
      include: {
        documents: {
          where: { isActive: true }
        },
        children: {
          include: {
            documents: {
              where: { isActive: true }
            },
            children: true,
            _count: {
              select: { documents: true }
            }
          }
        },
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(
    companyId: number,
    data: {
      name: string;
      description?: string;
      icon?: string;
      parentId?: number;
    }
  ): Promise<DocumentCategory> {
    return this.prisma.documentCategory.create({
      data: {
        ...data,
        companyId
      }
    });
  }

  async updateCategory(
    categoryId: number,
    companyId: number,
    data: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ): Promise<DocumentCategory> {
    return this.prisma.documentCategory.update({
      where: {
        id: categoryId,
        companyId
      },
      data
    });
  }

  async deleteCategory(
    categoryId: number,
    companyId: number
  ): Promise<boolean> {
    // Check if category has documents
    const documentsCount = await this.prisma.document.count({
      where: {
        categoryId,
        companyId,
        isActive: true
      }
    });

    if (documentsCount > 0) {
      throw new Error('Cannot delete category with documents. Move documents first.');
    }

    await this.prisma.documentCategory.delete({
      where: {
        id: categoryId,
        companyId
      }
    });

    return true;
  }

  // Get Document Statistics
  async getDocumentStats(companyId: number): Promise<{
    totalDocuments: number;
    totalSize: number;
    documentsByCategory: { category: string; count: number }[];
    documentsByType: { mimeType: string; count: number }[];
    recentUploads: number;
  }> {
    const [
      totalDocuments,
      sizeResult,
      byCategory,
      byType,
      recentUploads
    ] = await Promise.all([
      // Total documents
      this.prisma.document.count({
        where: { companyId, isActive: true }
      }),
      
      // Total size
      this.prisma.document.aggregate({
        where: { companyId, isActive: true },
        _sum: { fileSize: true }
      }),
      
      // By category
      this.prisma.document.groupBy({
        by: ['categoryId'],
        where: { companyId, isActive: true },
        _count: true
      }),
      
      // By type
      this.prisma.document.groupBy({
        by: ['mimeType'],
        where: { companyId, isActive: true },
        _count: true,
        orderBy: { _count: { mimeType: 'desc' } }
      }),
      
      // Recent uploads (last 7 days)
      this.prisma.document.count({
        where: {
          companyId,
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get category names
    const categories = await this.prisma.documentCategory.findMany({
      where: { companyId },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return {
      totalDocuments,
      totalSize: Number(sizeResult._sum.fileSize || 0),
      documentsByCategory: byCategory.map(item => ({
        category: categoryMap.get(item.categoryId) || 'Uncategorized',
        count: item._count
      })),
      documentsByType: byType.map(item => ({
        mimeType: item.mimeType,
        count: item._count
      })),
      recentUploads
    };
  }
}

export default DocumentService;