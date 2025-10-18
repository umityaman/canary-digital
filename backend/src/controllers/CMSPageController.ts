import { Request, Response } from 'express';
import PageService from '../services/PageService';

class CMSPageController {
  /**
   * Create new page
   * POST /api/cms/pages
   */
  async createPage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const authorId = (req as any).user.userId;

      const page = await PageService.createPage(companyId, authorId, req.body);

      res.status(201).json({
        success: true,
        message: 'Page created successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error creating page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create page'
      });
    }
  }

  /**
   * Get page by ID
   * GET /api/cms/pages/:id
   */
  async getPageById(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);

      const page = await PageService.getPageById(pageId, companyId);

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      res.json({
        success: true,
        data: page
      });
    } catch (error: any) {
      console.error('Error getting page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get page'
      });
    }
  }

  /**
   * Get page by slug
   * GET /api/cms/pages/slug/:slug
   */
  async getPageBySlug(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const slug = req.params.slug;

      const page = await PageService.getPageBySlug(slug, companyId);

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      // Check if page is password protected
      if (page.password && req.query.password !== page.password) {
        return res.status(403).json({
          success: false,
          message: 'Password required',
          requiresPassword: true
        });
      }

      res.json({
        success: true,
        data: page
      });
    } catch (error: any) {
      console.error('Error getting page by slug:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get page'
      });
    }
  }

  /**
   * List pages with filters
   * GET /api/cms/pages
   */
  async listPages(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: any = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';
      if (req.query.showInMenu !== undefined) filters.showInMenu = req.query.showInMenu === 'true';
      if (req.query.template) filters.template = req.query.template;
      if (req.query.search) filters.search = req.query.search;
      
      if (req.query.parentId !== undefined) {
        filters.parentId = req.query.parentId === 'null' ? null : parseInt(req.query.parentId as string);
      }

      const result = await PageService.listPages(companyId, filters, page, limit);

      res.json({
        success: true,
        data: result.pages,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      console.error('Error listing pages:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list pages'
      });
    }
  }

  /**
   * Update page
   * PUT /api/cms/pages/:id
   */
  async updatePage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);

      const page = await PageService.updatePage(pageId, companyId, req.body);

      res.json({
        success: true,
        message: 'Page updated successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error updating page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update page'
      });
    }
  }

  /**
   * Delete page
   * DELETE /api/cms/pages/:id
   */
  async deletePage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);

      const result = await PageService.deletePage(pageId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete page'
      });
    }
  }

  /**
   * Publish page
   * POST /api/cms/pages/:id/publish
   */
  async publishPage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);

      const page = await PageService.publishPage(pageId, companyId);

      res.json({
        success: true,
        message: 'Page published successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error publishing page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to publish page'
      });
    }
  }

  /**
   * Unpublish page
   * POST /api/cms/pages/:id/unpublish
   */
  async unpublishPage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);

      const page = await PageService.unpublishPage(pageId, companyId);

      res.json({
        success: true,
        message: 'Page unpublished successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error unpublishing page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unpublish page'
      });
    }
  }

  /**
   * Schedule page
   * POST /api/cms/pages/:id/schedule
   */
  async schedulePage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const pageId = parseInt(req.params.id);
      const { scheduledFor } = req.body;

      if (!scheduledFor) {
        return res.status(400).json({
          success: false,
          message: 'scheduledFor date is required'
        });
      }

      const page = await PageService.schedulePage(
        pageId,
        companyId,
        new Date(scheduledFor)
      );

      res.json({
        success: true,
        message: 'Page scheduled successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error scheduling page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to schedule page'
      });
    }
  }

  /**
   * Duplicate page
   * POST /api/cms/pages/:id/duplicate
   */
  async duplicatePage(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const authorId = (req as any).user.userId;
      const pageId = parseInt(req.params.id);

      const page = await PageService.duplicatePage(pageId, companyId, authorId);

      res.status(201).json({
        success: true,
        message: 'Page duplicated successfully',
        data: page
      });
    } catch (error: any) {
      console.error('Error duplicating page:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to duplicate page'
      });
    }
  }

  /**
   * Get page hierarchy
   * GET /api/cms/pages/hierarchy
   */
  async getPageHierarchy(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const hierarchy = await PageService.getPageHierarchy(companyId);

      res.json({
        success: true,
        data: hierarchy
      });
    } catch (error: any) {
      console.error('Error getting page hierarchy:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get page hierarchy'
      });
    }
  }

  /**
   * Get page statistics
   * GET /api/cms/pages/statistics
   */
  async getPageStatistics(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const stats = await PageService.getPageStatistics(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting page statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get page statistics'
      });
    }
  }
}

export default new CMSPageController();
