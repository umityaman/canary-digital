import { Request, Response } from 'express';
import BlogService from '../services/BlogService';

class BlogController {
  // ============================================
  // BLOG POST MANAGEMENT
  // ============================================

  /**
   * Create blog post
   * POST /api/cms/blog/posts
   */
  async createBlogPost(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const authorId = (req as any).user.userId;

      const post = await BlogService.createBlogPost(companyId, authorId, req.body);

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: post
      });
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create blog post'
      });
    }
  }

  /**
   * Get blog post by ID
   * GET /api/cms/blog/posts/:id
   */
  async getBlogPostById(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const postId = parseInt(req.params.id);

      const post = await BlogService.getBlogPostById(postId, companyId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error: any) {
      console.error('Error getting blog post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get blog post'
      });
    }
  }

  /**
   * Get blog post by slug
   * GET /api/cms/blog/posts/slug/:slug
   */
  async getBlogPostBySlug(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const slug = req.params.slug;

      const post = await BlogService.getBlogPostBySlug(slug, companyId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error: any) {
      console.error('Error getting blog post by slug:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get blog post'
      });
    }
  }

  /**
   * List blog posts
   * GET /api/cms/blog/posts
   */
  async listBlogPosts(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: any = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.categoryId) filters.categoryId = parseInt(req.query.categoryId as string);
      if (req.query.tagId) filters.tagId = parseInt(req.query.tagId as string);
      if (req.query.isFeatured !== undefined) filters.isFeatured = req.query.isFeatured === 'true';
      if (req.query.isSticky !== undefined) filters.isSticky = req.query.isSticky === 'true';
      if (req.query.authorId) filters.authorId = parseInt(req.query.authorId as string);
      if (req.query.search) filters.search = req.query.search;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const result = await BlogService.listBlogPosts(companyId, filters, page, limit);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      console.error('Error listing blog posts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list blog posts'
      });
    }
  }

  /**
   * Update blog post
   * PUT /api/cms/blog/posts/:id
   */
  async updateBlogPost(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const postId = parseInt(req.params.id);

      const post = await BlogService.updateBlogPost(postId, companyId, req.body);

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        data: post
      });
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update blog post'
      });
    }
  }

  /**
   * Delete blog post
   * DELETE /api/cms/blog/posts/:id
   */
  async deleteBlogPost(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const postId = parseInt(req.params.id);

      const result = await BlogService.deleteBlogPost(postId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete blog post'
      });
    }
  }

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================

  /**
   * Create category
   * POST /api/cms/blog/categories
   */
  async createCategory(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const category = await BlogService.createCategory(companyId, req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create category'
      });
    }
  }

  /**
   * List categories
   * GET /api/cms/blog/categories
   */
  async listCategories(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const categories = await BlogService.listCategories(companyId);

      res.json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      console.error('Error listing categories:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list categories'
      });
    }
  }

  /**
   * Update category
   * PUT /api/cms/blog/categories/:id
   */
  async updateCategory(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const categoryId = parseInt(req.params.id);

      const category = await BlogService.updateCategory(categoryId, companyId, req.body);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update category'
      });
    }
  }

  /**
   * Delete category
   * DELETE /api/cms/blog/categories/:id
   */
  async deleteCategory(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const categoryId = parseInt(req.params.id);

      const result = await BlogService.deleteCategory(categoryId, companyId);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete category'
      });
    }
  }

  // ============================================
  // TAG MANAGEMENT
  // ============================================

  /**
   * List tags
   * GET /api/cms/blog/tags
   */
  async listTags(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const tags = await BlogService.listTags(companyId);

      res.json({
        success: true,
        data: tags
      });
    } catch (error: any) {
      console.error('Error listing tags:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list tags'
      });
    }
  }

  // ============================================
  // COMMENT MANAGEMENT
  // ============================================

  /**
   * Add comment to post
   * POST /api/cms/blog/posts/:id/comments
   */
  async addComment(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const postId = parseInt(req.params.id);
      const userId = (req as any).user?.userId;

      const commentData = {
        ...req.body,
        authorId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };

      const comment = await BlogService.addComment(postId, companyId, commentData);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully (pending moderation)',
        data: comment
      });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add comment'
      });
    }
  }

  /**
   * Approve comment
   * POST /api/cms/blog/comments/:id/approve
   */
  async approveComment(req: Request, res: Response) {
    try {
      const commentId = parseInt(req.params.id);

      const comment = await BlogService.approveComment(commentId);

      res.json({
        success: true,
        message: 'Comment approved successfully',
        data: comment
      });
    } catch (error: any) {
      console.error('Error approving comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve comment'
      });
    }
  }

  /**
   * Delete comment
   * DELETE /api/cms/blog/comments/:id
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const commentId = parseInt(req.params.id);

      const result = await BlogService.deleteComment(commentId);

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete comment'
      });
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get blog statistics
   * GET /api/cms/blog/statistics
   */
  async getBlogStatistics(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const stats = await BlogService.getBlogStatistics(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting blog statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get blog statistics'
      });
    }
  }
}

export default new BlogController();
