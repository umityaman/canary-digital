import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const prisma = new PrismaClient();

// NOTE: For production, integrate with cloud storage (Cloudinary, AWS S3, Azure Blob)
// This service provides basic file management foundation

interface UploadedFile {
  originalName: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  buffer?: Buffer;
  path?: string;
}

interface CreateMediaFileInput {
  file: UploadedFile;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: number;
  tags?: string[];
}

interface UpdateMediaFileInput {
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: number;
  tags?: string[];
  isPublic?: boolean;
}

interface MediaFilters {
  type?: string; // image, video, audio, document
  folderId?: number | null;
  search?: string;
  isPublic?: boolean;
  uploadedById?: number;
}

class MediaService {
  // Upload directory (use environment variable in production)
  private uploadDir = process.env.UPLOAD_DIR || './uploads/media';
  private baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:3000/uploads/media';

  /**
   * Initialize upload directory
   */
  async initialize() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Determine media type from MIME type
   */
  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || 
        mimeType.includes('word') || mimeType.includes('excel') ||
        mimeType.includes('text')) return 'document';
    return 'document';
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  /**
   * Get image dimensions (placeholder - integrate with sharp or jimp)
   */
  private async getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
    // TODO: Integrate with image processing library (sharp recommended)
    // For now, return null - implement when needed
    return null;
  }

  /**
   * Generate thumbnail (placeholder - integrate with sharp)
   */
  private async generateThumbnail(filePath: string, filename: string): Promise<string | null> {
    // TODO: Integrate with sharp for thumbnail generation
    // Example: sharp(filePath).resize(300, 300).toFile(`${this.uploadDir}/thumbs/${filename}`)
    return null;
  }

  /**
   * Upload media file
   */
  async uploadMedia(
    companyId: number,
    uploadedById: number,
    data: CreateMediaFileInput
  ) {
    await this.initialize();

    const { file } = data;
    const filename = this.generateFilename(file.originalName);
    const filePath = path.join(this.uploadDir, filename);
    const url = `${this.baseUrl}/${filename}`;

    // Save file to disk
    if (file.buffer) {
      await fs.writeFile(filePath, file.buffer);
    } else if (file.path) {
      await fs.copyFile(file.path, filePath);
    } else {
      throw new Error('No file buffer or path provided');
    }

    // Determine media type
    const type = this.getMediaType(file.mimeType);

    // Get image dimensions if image
    let width: number | undefined;
    let height: number | undefined;
    let thumbnailUrl: string | undefined;

    if (type === 'image') {
      const dimensions = await this.getImageDimensions(filePath);
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }

      const thumbnail = await this.generateThumbnail(filePath, filename);
      if (thumbnail) {
        thumbnailUrl = `${this.baseUrl}/thumbs/${thumbnail}`;
      }
    }

    // Create database record
    const mediaFile = await prisma.mediaFile.create({
      data: {
        companyId,
        uploadedById,
        filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        url,
        thumbnailUrl,
        type,
        width,
        height,
        title: data.title || file.originalName,
        altText: data.altText,
        caption: data.caption,
        description: data.description,
        folderId: data.folderId,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isPublic: true
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: true
      }
    });

    return mediaFile;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    companyId: number,
    uploadedById: number,
    files: UploadedFile[],
    folderId?: number
  ) {
    const results = await Promise.allSettled(
      files.map(file =>
        this.uploadMedia(companyId, uploadedById, { file, folderId })
      )
    );

    return {
      successful: results.filter(r => r.status === 'fulfilled').map(r => (r as any).value),
      failed: results.filter(r => r.status === 'rejected').length
    };
  }

  /**
   * Get media file by ID
   */
  async getMediaById(mediaId: number, companyId: number) {
    const media = await prisma.mediaFile.findFirst({
      where: {
        id: mediaId,
        companyId
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: true
      }
    });

    return media;
  }

  /**
   * List media files
   */
  async listMedia(
    companyId: number,
    filters: MediaFilters = {},
    page: number = 1,
    limit: number = 50
  ) {
    const where: any = { companyId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.folderId !== undefined) {
      where.folderId = filters.folderId;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.uploadedById) {
      where.uploadedById = filters.uploadedById;
    }

    if (filters.search) {
      where.OR = [
        { filename: { contains: filters.search, mode: 'insensitive' } },
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mediaFile.count({ where })
    ]);

    return {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update media file metadata
   */
  async updateMedia(
    mediaId: number,
    companyId: number,
    data: UpdateMediaFileInput
  ) {
    const existing = await prisma.mediaFile.findFirst({
      where: { id: mediaId, companyId }
    });

    if (!existing) {
      throw new Error('Media file not found');
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.altText !== undefined) updateData.altText = data.altText;
    if (data.caption !== undefined) updateData.caption = data.caption;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

    const media = await prisma.mediaFile.update({
      where: { id: mediaId },
      data: updateData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: true
      }
    });

    return media;
  }

  /**
   * Delete media file
   */
  async deleteMedia(mediaId: number, companyId: number) {
    const media = await prisma.mediaFile.findFirst({
      where: { id: mediaId, companyId }
    });

    if (!media) {
      throw new Error('Media file not found');
    }

    // Delete physical file
    const filePath = path.join(this.uploadDir, media.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete physical file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete thumbnail if exists
    if (media.thumbnailUrl) {
      const thumbFilename = path.basename(media.thumbnailUrl);
      const thumbPath = path.join(this.uploadDir, 'thumbs', thumbFilename);
      try {
        await fs.unlink(thumbPath);
      } catch (error) {
        console.error('Failed to delete thumbnail:', error);
      }
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id: mediaId }
    });

    return { success: true, message: 'Media file deleted successfully' };
  }

  /**
   * Delete multiple media files
   */
  async deleteMultiple(companyId: number, mediaIds: number[]) {
    const results = await Promise.allSettled(
      mediaIds.map(id => this.deleteMedia(id, companyId))
    );

    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }

  // ============================================
  // FOLDER MANAGEMENT
  // ============================================

  /**
   * Create media folder
   */
  async createFolder(
    companyId: number,
    data: {
      name: string;
      parentId?: number;
    }
  ) {
    const slug = this.generateSlug(data.name);
    const uniqueSlug = await this.ensureUniqueFolderSlug(companyId, slug);

    const folder = await prisma.mediaFolder.create({
      data: {
        companyId,
        name: data.name,
        slug: uniqueSlug,
        parentId: data.parentId
      },
      include: {
        parent: true,
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      }
    });

    return folder;
  }

  /**
   * List folders
   */
  async listFolders(companyId: number, parentId?: number | null) {
    const folders = await prisma.mediaFolder.findMany({
      where: {
        companyId,
        ...(parentId !== undefined ? { parentId } : {})
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return folders;
  }

  /**
   * Get folder hierarchy
   */
  async getFolderHierarchy(companyId: number) {
    const folders = await prisma.mediaFolder.findMany({
      where: {
        companyId,
        parentId: null
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        },
        _count: {
          select: { files: true }
        }
      }
    });

    return folders;
  }

  /**
   * Update folder
   */
  async updateFolder(
    folderId: number,
    companyId: number,
    data: {
      name?: string;
      parentId?: number;
    }
  ) {
    const existing = await prisma.mediaFolder.findFirst({
      where: { id: folderId, companyId }
    });

    if (!existing) {
      throw new Error('Folder not found');
    }

    let slug: string | undefined;
    if (data.name) {
      slug = this.generateSlug(data.name);
      slug = await this.ensureUniqueFolderSlug(companyId, slug, folderId);
    }

    const folder = await prisma.mediaFolder.update({
      where: { id: folderId },
      data: {
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        ...(data.parentId !== undefined && { parentId: data.parentId })
      },
      include: {
        parent: true,
        _count: {
          select: { files: true, children: true }
        }
      }
    });

    return folder;
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: number, companyId: number) {
    const folder = await prisma.mediaFolder.findFirst({
      where: { id: folderId, companyId },
      include: {
        files: true,
        children: true
      }
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    if (folder.children.length > 0) {
      throw new Error('Cannot delete folder with subfolders. Delete subfolders first.');
    }

    if (folder.files.length > 0) {
      throw new Error('Cannot delete folder with files. Move or delete files first.');
    }

    await prisma.mediaFolder.delete({
      where: { id: folderId }
    });

    return { success: true, message: 'Folder deleted successfully' };
  }

  /**
   * Move files to folder
   */
  async moveFilesToFolder(
    companyId: number,
    fileIds: number[],
    folderId: number | null
  ) {
    // Verify files belong to company
    const files = await prisma.mediaFile.findMany({
      where: {
        id: { in: fileIds },
        companyId
      }
    });

    if (files.length !== fileIds.length) {
      throw new Error('Some files not found or do not belong to this company');
    }

    // Verify folder exists if provided
    if (folderId) {
      const folder = await prisma.mediaFolder.findFirst({
        where: { id: folderId, companyId }
      });

      if (!folder) {
        throw new Error('Folder not found');
      }
    }

    // Move files
    await prisma.mediaFile.updateMany({
      where: { id: { in: fileIds } },
      data: { folderId }
    });

    return { success: true, moved: files.length };
  }

  /**
   * Get media statistics
   */
  async getMediaStatistics(companyId: number) {
    const [
      totalFiles,
      images,
      videos,
      documents,
      totalSize,
      totalFolders
    ] = await Promise.all([
      prisma.mediaFile.count({ where: { companyId } }),
      prisma.mediaFile.count({ where: { companyId, type: 'image' } }),
      prisma.mediaFile.count({ where: { companyId, type: 'video' } }),
      prisma.mediaFile.count({ where: { companyId, type: 'document' } }),
      prisma.mediaFile.aggregate({
        where: { companyId },
        _sum: { fileSize: true }
      }),
      prisma.mediaFolder.count({ where: { companyId } })
    ]);

    return {
      totalFiles,
      images,
      videos,
      documents,
      totalSize: totalSize._sum.fileSize || 0,
      totalSizeMB: ((totalSize._sum.fileSize || 0) / (1024 * 1024)).toFixed(2),
      totalFolders
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generateSlug(name: string): string {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    let slug = name.toLowerCase();
    Object.keys(turkishMap).forEach(key => {
      slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
    });
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
  }

  private async ensureUniqueFolderSlug(
    companyId: number,
    baseSlug: string,
    excludeId?: number
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.mediaFolder.findFirst({
        where: {
          companyId,
          slug,
          ...(excludeId ? { id: { not: excludeId } } : {})
        }
      });

      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}

export default new MediaService();
