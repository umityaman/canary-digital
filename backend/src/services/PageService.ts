import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePageInput {
  title: string;
  content: string;
  excerpt?: string;
  template?: string;
  layout?: string;
  parentId?: number;
  status?: string;
  isPublic?: boolean;
  password?: string;
  showInMenu?: boolean;
  menuOrder?: number;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishedAt?: Date;
  scheduledFor?: Date;
}

interface UpdatePageInput extends Partial<CreatePageInput> {
  slug?: string;
}

interface PageFilters {
  status?: string;
  isPublic?: boolean;
  showInMenu?: boolean;
  parentId?: number | null;
  template?: string;
  search?: string;
}

class PageService {
  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    let slug = title.toLowerCase();
    
    // Replace Turkish characters
    Object.keys(turkishMap).forEach(key => {
      slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
    });

    // Replace non-alphanumeric characters with hyphens
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    
    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
  }

  /**
   * Ensure slug is unique within company
   */
  private async ensureUniqueSlug(
    companyId: number,
    baseSlug: string,
    excludePageId?: number
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.cMSPage.findFirst({
        where: {
          companyId,
          slug,
          ...(excludePageId ? { id: { not: excludePageId } } : {})
        }
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new page
   */
  async createPage(
    companyId: number,
    authorId: number,
    data: CreatePageInput
  ) {
    // Generate slug
    const baseSlug = this.generateSlug(data.title);
    const slug = await this.ensureUniqueSlug(companyId, baseSlug);

    // Handle publish status
    const now = new Date();
    let publishedAt = data.publishedAt;
    
    if (data.status === 'published' && !publishedAt) {
      publishedAt = now;
    }

    const page = await prisma.cMSPage.create({
      data: {
        companyId,
        authorId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        template: data.template || 'default',
        layout: data.layout || 'full-width',
        parentId: data.parentId,
        status: data.status || 'draft',
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        password: data.password,
        showInMenu: data.showInMenu !== undefined ? data.showInMenu : true,
        menuOrder: data.menuOrder || 0,
        icon: data.icon,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        publishedAt,
        scheduledFor: data.scheduledFor,
        version: 1
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return page;
  }

  /**
   * Get page by ID
   */
  async getPageById(pageId: number, companyId: number) {
    const page = await prisma.cMSPage.findFirst({
      where: {
        id: pageId,
        companyId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            publishedAt: true
          },
          orderBy: {
            menuOrder: 'asc'
          }
        }
      }
    });

    return page;
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string, companyId: number) {
    const page = await prisma.cMSPage.findFirst({
      where: {
        slug,
        companyId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: true,
        children: {
          where: {
            status: 'published',
            isPublic: true
          },
          orderBy: {
            menuOrder: 'asc'
          }
        }
      }
    });

    // Increment view count
    if (page && page.status === 'published') {
      await prisma.cMSPage.update({
        where: { id: page.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return page;
  }

  /**
   * List pages with filters and pagination
   */
  async listPages(
    companyId: number,
    filters: PageFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { companyId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.showInMenu !== undefined) {
      where.showInMenu = filters.showInMenu;
    }

    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    if (filters.template) {
      where.template = filters.template;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.cMSPage.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          parent: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          _count: {
            select: {
              children: true
            }
          }
        },
        orderBy: [
          { menuOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.cMSPage.count({ where })
    ]);

    return {
      pages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update page
   */
  async updatePage(
    pageId: number,
    companyId: number,
    data: UpdatePageInput
  ) {
    // Verify page exists and belongs to company
    const existingPage = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId }
    });

    if (!existingPage) {
      throw new Error('Page not found');
    }

    // Handle slug update
    let slug = data.slug;
    if (data.title && !slug) {
      const baseSlug = this.generateSlug(data.title);
      slug = await this.ensureUniqueSlug(companyId, baseSlug, pageId);
    } else if (slug) {
      slug = await this.ensureUniqueSlug(companyId, slug, pageId);
    }

    // Handle publish status
    let publishedAt = data.publishedAt;
    if (data.status === 'published' && !existingPage.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (slug) updateData.slug = slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.layout !== undefined) updateData.layout = data.layout;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.showInMenu !== undefined) updateData.showInMenu = data.showInMenu;
    if (data.menuOrder !== undefined) updateData.menuOrder = data.menuOrder;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.metaKeywords !== undefined) updateData.metaKeywords = data.metaKeywords;
    if (data.ogTitle !== undefined) updateData.ogTitle = data.ogTitle;
    if (data.ogDescription !== undefined) updateData.ogDescription = data.ogDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
    if (publishedAt) updateData.publishedAt = publishedAt;
    if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;

    // Increment version
    updateData.version = { increment: 1 };

    const page = await prisma.cMSPage.update({
      where: { id: pageId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: true
      }
    });

    return page;
  }

  /**
   * Delete page
   */
  async deletePage(pageId: number, companyId: number) {
    // Verify page exists and belongs to company
    const page = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId },
      include: {
        children: true
      }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    // Check if page has children
    if (page.children.length > 0) {
      throw new Error('Cannot delete page with child pages. Delete or reassign children first.');
    }

    await prisma.cMSPage.delete({
      where: { id: pageId }
    });

    return { success: true, message: 'Page deleted successfully' };
  }

  /**
   * Publish page
   */
  async publishPage(pageId: number, companyId: number) {
    const page = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    const updatedPage = await prisma.cMSPage.update({
      where: { id: pageId },
      data: {
        status: 'published',
        publishedAt: page.publishedAt || new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedPage;
  }

  /**
   * Unpublish page (set to draft)
   */
  async unpublishPage(pageId: number, companyId: number) {
    const page = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    const updatedPage = await prisma.cMSPage.update({
      where: { id: pageId },
      data: {
        status: 'draft'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedPage;
  }

  /**
   * Schedule page publication
   */
  async schedulePage(
    pageId: number,
    companyId: number,
    scheduledFor: Date
  ) {
    const page = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    const updatedPage = await prisma.cMSPage.update({
      where: { id: pageId },
      data: {
        status: 'scheduled',
        scheduledFor
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedPage;
  }

  /**
   * Get page hierarchy (parent-child relationships)
   */
  async getPageHierarchy(companyId: number) {
    const pages = await prisma.cMSPage.findMany({
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
          },
          orderBy: {
            menuOrder: 'asc'
          }
        }
      },
      orderBy: {
        menuOrder: 'asc'
      }
    });

    return pages;
  }

  /**
   * Duplicate page
   */
  async duplicatePage(pageId: number, companyId: number, authorId: number) {
    const originalPage = await prisma.cMSPage.findFirst({
      where: { id: pageId, companyId }
    });

    if (!originalPage) {
      throw new Error('Page not found');
    }

    // Generate new title and slug
    const newTitle = `${originalPage.title} (Copy)`;
    const baseSlug = this.generateSlug(newTitle);
    const newSlug = await this.ensureUniqueSlug(companyId, baseSlug);

    const duplicatedPage = await prisma.cMSPage.create({
      data: {
        companyId,
        authorId,
        title: newTitle,
        slug: newSlug,
        content: originalPage.content,
        excerpt: originalPage.excerpt,
        template: originalPage.template,
        layout: originalPage.layout,
        status: 'draft', // Always create as draft
        isPublic: originalPage.isPublic,
        showInMenu: false, // Don't show in menu by default
        menuOrder: originalPage.menuOrder,
        icon: originalPage.icon,
        metaTitle: originalPage.metaTitle,
        metaDescription: originalPage.metaDescription,
        metaKeywords: originalPage.metaKeywords,
        ogTitle: originalPage.ogTitle,
        ogDescription: originalPage.ogDescription,
        ogImage: originalPage.ogImage,
        version: 1
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return duplicatedPage;
  }

  /**
   * Get page statistics
   */
  async getPageStatistics(companyId: number) {
    const [
      total,
      published,
      draft,
      scheduled,
      archived,
      totalViews
    ] = await Promise.all([
      prisma.cMSPage.count({ where: { companyId } }),
      prisma.cMSPage.count({ where: { companyId, status: 'published' } }),
      prisma.cMSPage.count({ where: { companyId, status: 'draft' } }),
      prisma.cMSPage.count({ where: { companyId, status: 'scheduled' } }),
      prisma.cMSPage.count({ where: { companyId, status: 'archived' } }),
      prisma.cMSPage.aggregate({
        where: { companyId },
        _sum: { viewCount: true }
      })
    ]);

    return {
      total,
      published,
      draft,
      scheduled,
      archived,
      totalViews: totalViews._sum.viewCount || 0
    };
  }

  /**
   * Process scheduled pages (should be run by a cron job)
   */
  async processScheduledPages() {
    const now = new Date();

    const scheduledPages = await prisma.cMSPage.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now
        }
      }
    });

    const results = await Promise.allSettled(
      scheduledPages.map(page =>
        prisma.cMSPage.update({
          where: { id: page.id },
          data: {
            status: 'published',
            publishedAt: now
          }
        })
      )
    );

    return {
      processed: scheduledPages.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }
}

export default new PageService();
