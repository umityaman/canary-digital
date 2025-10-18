import { Request, Response } from 'express';
import MenuService from '../services/MenuService';

class MenuController {
  // ============================================
  // MENU MANAGEMENT
  // ============================================

  /**
   * Create menu
   * POST /api/cms/menus
   */
  async createMenu(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const menu = await MenuService.createMenu(companyId, req.body);

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        data: menu
      });
    } catch (error: any) {
      console.error('Error creating menu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create menu'
      });
    }
  }

  /**
   * Get menu by ID
   * GET /api/cms/menus/:id
   */
  async getMenuById(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.id);

      const menu = await MenuService.getMenuById(menuId, companyId);

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      res.json({
        success: true,
        data: menu
      });
    } catch (error: any) {
      console.error('Error getting menu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu'
      });
    }
  }

  /**
   * Get menu by slug
   * GET /api/cms/menus/slug/:slug
   */
  async getMenuBySlug(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const slug = req.params.slug;

      const menu = await MenuService.getMenuBySlug(slug, companyId);

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      res.json({
        success: true,
        data: menu
      });
    } catch (error: any) {
      console.error('Error getting menu by slug:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu'
      });
    }
  }

  /**
   * Get menu by location
   * GET /api/cms/menus/location/:location
   */
  async getMenuByLocation(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const location = req.params.location;

      const menu = await MenuService.getMenuByLocation(location, companyId);

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found for this location'
        });
      }

      res.json({
        success: true,
        data: menu
      });
    } catch (error: any) {
      console.error('Error getting menu by location:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu'
      });
    }
  }

  /**
   * List all menus
   * GET /api/cms/menus
   */
  async listMenus(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const menus = await MenuService.listMenus(companyId);

      res.json({
        success: true,
        data: menus
      });
    } catch (error: any) {
      console.error('Error listing menus:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list menus'
      });
    }
  }

  /**
   * Update menu
   * PUT /api/cms/menus/:id
   */
  async updateMenu(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.id);

      const menu = await MenuService.updateMenu(menuId, companyId, req.body);

      res.json({
        success: true,
        message: 'Menu updated successfully',
        data: menu
      });
    } catch (error: any) {
      console.error('Error updating menu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update menu'
      });
    }
  }

  /**
   * Delete menu
   * DELETE /api/cms/menus/:id
   */
  async deleteMenu(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.id);

      const result = await MenuService.deleteMenu(menuId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting menu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete menu'
      });
    }
  }

  /**
   * Duplicate menu
   * POST /api/cms/menus/:id/duplicate
   */
  async duplicateMenu(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.id);

      const menu = await MenuService.duplicateMenu(menuId, companyId);

      res.status(201).json({
        success: true,
        message: 'Menu duplicated successfully',
        data: menu
      });
    } catch (error: any) {
      console.error('Error duplicating menu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to duplicate menu'
      });
    }
  }

  // ============================================
  // MENU ITEM MANAGEMENT
  // ============================================

  /**
   * Add menu item
   * POST /api/cms/menus/:menuId/items
   */
  async addMenuItem(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.menuId);

      const menuItem = await MenuService.addMenuItem(menuId, companyId, req.body);

      res.status(201).json({
        success: true,
        message: 'Menu item added successfully',
        data: menuItem
      });
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add menu item'
      });
    }
  }

  /**
   * Get menu item by ID
   * GET /api/cms/menus/items/:itemId
   */
  async getMenuItemById(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);

      const menuItem = await MenuService.getMenuItemById(itemId);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        data: menuItem
      });
    } catch (error: any) {
      console.error('Error getting menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu item'
      });
    }
  }

  /**
   * Update menu item
   * PUT /api/cms/menus/items/:itemId
   */
  async updateMenuItem(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const itemId = parseInt(req.params.itemId);

      const menuItem = await MenuService.updateMenuItem(itemId, companyId, req.body);

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem
      });
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update menu item'
      });
    }
  }

  /**
   * Delete menu item
   * DELETE /api/cms/menus/items/:itemId
   */
  async deleteMenuItem(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const itemId = parseInt(req.params.itemId);

      const result = await MenuService.deleteMenuItem(itemId, companyId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete menu item'
      });
    }
  }

  /**
   * Reorder menu items
   * POST /api/cms/menus/:menuId/reorder
   */
  async reorderMenuItems(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.menuId);
      const { itemOrders } = req.body;

      if (!Array.isArray(itemOrders)) {
        return res.status(400).json({
          success: false,
          message: 'itemOrders array is required'
        });
      }

      const result = await MenuService.reorderMenuItems(menuId, companyId, itemOrders);

      res.json({
        success: true,
        message: 'Menu items reordered successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error reordering menu items:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reorder menu items'
      });
    }
  }

  /**
   * Bulk add pages as menu items
   * POST /api/cms/menus/:menuId/items/bulk-add-pages
   */
  async addPagesAsMenuItems(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const menuId = parseInt(req.params.menuId);
      const { pageIds } = req.body;

      if (!Array.isArray(pageIds) || pageIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'pageIds array is required'
        });
      }

      const result = await MenuService.addPagesAsMenuItems(menuId, companyId, pageIds);

      res.status(201).json({
        success: true,
        message: `${result.added} pages added to menu successfully`,
        data: result
      });
    } catch (error: any) {
      console.error('Error adding pages as menu items:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add pages to menu'
      });
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get menu statistics
   * GET /api/cms/menus/statistics
   */
  async getMenuStatistics(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const stats = await MenuService.getMenuStatistics(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting menu statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu statistics'
      });
    }
  }
}

export default new MenuController();
