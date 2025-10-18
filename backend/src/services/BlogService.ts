import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: number;
  tags?: string[]; // Tag names or IDs
  status?: string;
  publishedAt?: Date;
  scheduledFor?: Date;
  allowComments?: boolean;
  isFeatured?: boolean;
  isSticky?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  slug?: string;
}

interface BlogPostFilters {
  status?: string;
  categoryId?: number;
  tagId?: number;
  isFeatured?: boolean;
  isSticky?: boolean;
  authorId?: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

class BlogService {
  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    let slug = title.toLowerCase();
    Object.keys(turkishMap).forEach(key => {
      slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
    });
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
  }

  /**
   * Ensure unique slug
   */
  private async ensureUniqueSlug(
    companyId: number,
    baseSlug: string,
    excludePostId?: number
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.blogPost.findFirst({
        where: {
          companyId,
          slug,
          ...(excludePostId ? { id: { not: excludePostId } } : {})
        }
      });

      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Calculate reading time (words per minute)
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Create blog post
   */
  async createBlogPost(
    companyId: number,
    authorId: number,
    data: CreateBlogPostInput
  ) {
    const baseSlug = this.generateSlug(data.title);
    const slug = await this.ensureUniqueSlug(companyId, baseSlug);

    const now = new Date();
    let publishedAt = data.publishedAt;
    
    if (data.status === 'published' && !publishedAt) {
      publishedAt = now;
    }

    const readingTime = this.calculateReadingTime(data.content);

    const post = await prisma.blogPost.create({
      data: {
        companyId,
        authorId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        categoryId: data.categoryId,
        status: data.status || 'draft',
        publishedAt,
        scheduledFor: data.scheduledFor,
        allowComments: data.allowComments !== undefined ? data.allowComments : true,
        isFeatured: data.isFeatured || false,
        isSticky: data.isSticky || false,
        readingTime,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: true
      }
    });

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      await this.addTagsToPost(post.id, companyId, data.tags);
    }

    return this.getBlogPostById(post.id, companyId);
  }

  /**
   * Get blog post by ID
   */
  async getBlogPostById(postId: number, companyId: number) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          where: { status: 'approved', parentId: null },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            },
            replies: {
              include: {
                author: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return post;
  }

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string, companyId: number) {
    const post = await this.getBlogPostById(0, companyId);
    
    const foundPost = await prisma.blogPost.findFirst({
      where: { slug, companyId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: true,
        tags: {
          include: { tag: true }
        },
        comments: {
          where: { status: 'approved', parentId: null },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            },
            replies: {
              include: {
                author: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Increment view count for published posts
    if (foundPost && foundPost.status === 'published') {
      await prisma.blogPost.update({
        where: { id: foundPost.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return foundPost;
  }

  /**
   * List blog posts
   */
  async listBlogPosts(
    companyId: number,
    filters: BlogPostFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { companyId };

    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.isSticky !== undefined) where.isSticky = filters.isSticky;
    if (filters.authorId) where.authorId = filters.authorId;

    if (filters.tagId) {
      where.tags = {
        some: {
          tagId: filters.tagId
        }
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.publishedAt = {};
      if (filters.dateFrom) where.publishedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.publishedAt.lte = filters.dateTo;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          category: true,
          tags: {
            include: { tag: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update blog post
   */
  async updateBlogPost(
    postId: number,
    companyId: number,
    data: UpdateBlogPostInput
  ) {
    const existing = await prisma.blogPost.findFirst({
      where: { id: postId, companyId }
    });

    if (!existing) {
      throw new Error('Blog post not found');
    }

    let slug = data.slug;
    if (data.title && !slug) {
      const baseSlug = this.generateSlug(data.title);
      slug = await this.ensureUniqueSlug(companyId, baseSlug, postId);
    } else if (slug) {
      slug = await this.ensureUniqueSlug(companyId, slug, postId);
    }

    let publishedAt = data.publishedAt;
    if (data.status === 'published' && !existing.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (slug) updateData.slug = slug;
    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.readingTime = this.calculateReadingTime(data.content);
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.allowComments !== undefined) updateData.allowComments = data.allowComments;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isSticky !== undefined) updateData.isSticky = data.isSticky;
    if (publishedAt) updateData.publishedAt = publishedAt;
    if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.metaKeywords !== undefined) updateData.metaKeywords = data.metaKeywords;
    if (data.ogTitle !== undefined) updateData.ogTitle = data.ogTitle;
    if (data.ogDescription !== undefined) updateData.ogDescription = data.ogDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: true,
        tags: {
          include: { tag: true }
        }
      }
    });

    // Update tags if provided
    if (data.tags) {
      await this.replaceTagsForPost(postId, companyId, data.tags);
    }

    return post;
  }

  /**
   * Delete blog post
   */
  async deleteBlogPost(postId: number, companyId: number) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId }
    });

    if (!post) {
      throw new Error('Blog post not found');
    }

    await prisma.blogPost.delete({
      where: { id: postId }
    });

    return { success: true, message: 'Blog post deleted successfully' };
  }

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================

  /**
   * Create category
   */
  async createCategory(
    companyId: number,
    data: {
      name: string;
      description?: string;
      parentId?: number;
      color?: string;
      icon?: string;
      metaTitle?: string;
      metaDescription?: string;
    }
  ) {
    const baseSlug = this.generateSlug(data.name);
    const slug = await this.ensureUniqueCategorySlug(companyId, baseSlug);

    const category = await prisma.blogCategory.create({
      data: {
        companyId,
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        color: data.color,
        icon: data.icon,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription
      },
      include: {
        parent: true,
        _count: {
          select: { posts: true }
        }
      }
    });

    return category;
  }

  /**
   * List categories
   */
  async listCategories(companyId: number) {
    const categories = await prisma.blogCategory.findMany({
      where: { companyId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return categories;
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: number,
    companyId: number,
    data: {
      name?: string;
      description?: string;
      parentId?: number;
      color?: string;
      icon?: string;
      order?: number;
      metaTitle?: string;
      metaDescription?: string;
    }
  ) {
    const existing = await prisma.blogCategory.findFirst({
      where: { id: categoryId, companyId }
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    let slug: string | undefined;
    if (data.name) {
      const baseSlug = this.generateSlug(data.name);
      slug = await this.ensureUniqueCategorySlug(companyId, baseSlug, categoryId);
    }

    const category = await prisma.blogCategory.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription })
      }
    });

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: number, companyId: number) {
    const category = await prisma.blogCategory.findFirst({
      where: { id: categoryId, companyId },
      include: {
        posts: true,
        children: true
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    if (category.posts.length > 0) {
      // Uncategorize posts
      await prisma.blogPost.updateMany({
        where: { categoryId },
        data: { categoryId: null }
      });
    }

    await prisma.blogCategory.delete({
      where: { id: categoryId }
    });

    return { success: true };
  }

  private async ensureUniqueCategorySlug(
    companyId: number,
    baseSlug: string,
    excludeId?: number
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.blogCategory.findFirst({
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

  // ============================================
  // TAG MANAGEMENT
  // ============================================

  /**
   * Create or get tag
   */
  async createOrGetTag(companyId: number, name: string) {
    const slug = this.generateSlug(name);

    const existing = await prisma.blogTag.findFirst({
      where: { companyId, slug }
    });

    if (existing) {
      return existing;
    }

    return prisma.blogTag.create({
      data: { companyId, name, slug }
    });
  }

  /**
   * Add tags to post
   */
  private async addTagsToPost(postId: number, companyId: number, tagNames: string[]) {
    for (const tagName of tagNames) {
      const tag = await this.createOrGetTag(companyId, tagName);
      
      await prisma.blogPostTag.create({
        data: {
          postId,
          tagId: tag.id
        }
      }).catch(() => {
        // Ignore duplicate errors
      });
    }
  }

  /**
   * Replace tags for post
   */
  private async replaceTagsForPost(postId: number, companyId: number, tagNames: string[]) {
    // Remove existing tags
    await prisma.blogPostTag.deleteMany({
      where: { postId }
    });

    // Add new tags
    await this.addTagsToPost(postId, companyId, tagNames);
  }

  /**
   * List tags
   */
  async listTags(companyId: number) {
    const tags = await prisma.blogTag.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return tags;
  }

  // ============================================
  // COMMENT MANAGEMENT
  // ============================================

  /**
   * Add comment to post
   */
  async addComment(
    postId: number,
    companyId: number,
    data: {
      content: string;
      authorId?: number;
      authorName?: string;
      authorEmail?: string;
      parentId?: number;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId }
    });

    if (!post) {
      throw new Error('Blog post not found');
    }

    if (!post.allowComments) {
      throw new Error('Comments are disabled for this post');
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        parentId: data.parentId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: 'pending' // Moderation required
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Increment comment count
    await prisma.blogPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    });

    return comment;
  }

  /**
   * Approve comment
   */
  async approveComment(commentId: number) {
    const comment = await prisma.blogComment.update({
      where: { id: commentId },
      data: { status: 'approved', isApproved: true }
    });

    return comment;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: number) {
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { post: true }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    await prisma.blogComment.delete({
      where: { id: commentId }
    });

    // Decrement comment count
    await prisma.blogPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } }
    });

    return { success: true };
  }

  /**
   * Get blog statistics
   */
  async getBlogStatistics(companyId: number) {
    const [
      totalPosts,
      published,
      draft,
      totalCategories,
      totalTags,
      totalComments,
      totalViews
    ] = await Promise.all([
      prisma.blogPost.count({ where: { companyId } }),
      prisma.blogPost.count({ where: { companyId, status: 'published' } }),
      prisma.blogPost.count({ where: { companyId, status: 'draft' } }),
      prisma.blogCategory.count({ where: { companyId } }),
      prisma.blogTag.count({ where: { companyId } }),
      prisma.blogComment.count({
        where: {
          post: { companyId }
        }
      }),
      prisma.blogPost.aggregate({
        where: { companyId },
        _sum: { viewCount: true }
      })
    ]);

    return {
      totalPosts,
      published,
      draft,
      totalCategories,
      totalTags,
      totalComments,
      totalViews: totalViews._sum.viewCount || 0
    };
  }
}

export default new BlogService();
