import { Router, Request, Response } from 'express';
import AdvancedSearchService, { SearchFilters } from '../services/search.service';

const router = Router();

// Middleware to check authentication (assuming you have this)
const authenticate = (req: any, res: Response, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

/**
 * @route POST /api/search/equipment
 * @desc Search equipment with advanced filters
 * @access Private
 */
router.post('/equipment', authenticate, async (req: any, res: Response) => {
  try {
    const filters: SearchFilters = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const result = await AdvancedSearchService.searchEquipment(companyId, filters);

    // Add to search history if query exists
    if (filters.query) {
      await AdvancedSearchService.addToHistory(
        req.user.id,
        companyId,
        'equipment',
        filters.query,
        filters,
        result.total
      ).catch(err => console.error('Failed to save search history:', err));
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error searching equipment:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route POST /api/search/customers
 * @desc Search customers with advanced filters
 * @access Private
 */
router.post('/customers', authenticate, async (req: any, res: Response) => {
  try {
    const filters: SearchFilters = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const result = await AdvancedSearchService.searchCustomers(companyId, filters);

    // Add to search history
    if (filters.query) {
      await AdvancedSearchService.addToHistory(
        req.user.id,
        companyId,
        'customer',
        filters.query,
        filters,
        result.total
      ).catch(err => console.error('Failed to save search history:', err));
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route POST /api/search/orders
 * @desc Search orders with advanced filters
 * @access Private
 */
router.post('/orders', authenticate, async (req: any, res: Response) => {
  try {
    const filters: SearchFilters = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const result = await AdvancedSearchService.searchOrders(companyId, filters);

    // Add to search history
    if (filters.query) {
      await AdvancedSearchService.addToHistory(
        req.user.id,
        companyId,
        'order',
        filters.query,
        filters,
        result.total
      ).catch(err => console.error('Failed to save search history:', err));
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error searching orders:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route GET /api/search/global
 * @desc Global search across all entities
 * @access Private
 */
router.get('/global', authenticate, async (req: any, res: Response) => {
  try {
    const { q, limit = 5 } = req.query;
    const companyId = req.user.companyId;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Query parameter required' });
    }

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const result = await AdvancedSearchService.globalSearch(
      companyId,
      q,
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error in global search:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route GET /api/search/filters/equipment
 * @desc Get available filter options for equipment
 * @access Private
 */
router.get('/filters/equipment', authenticate, async (req: any, res: Response) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const options = await AdvancedSearchService.getEquipmentFilterOptions(companyId);
    res.json(options);
  } catch (error: any) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route POST /api/search/save
 * @desc Save a search for later use
 * @access Private
 */
router.post('/save', authenticate, async (req: any, res: Response) => {
  try {
    const { name, description, entity, filters, sortBy, sortOrder, isShared } = req.body;

    if (!name || !entity || !filters) {
      return res.status(400).json({ message: 'Name, entity, and filters are required' });
    }

    const savedSearch = await AdvancedSearchService.saveSearch(
      req.user.id,
      req.user.companyId,
      { name, description, entity, filters, sortBy, sortOrder, isShared }
    );

    res.json({
      message: 'Search saved successfully',
      search: savedSearch,
    });
  } catch (error: any) {
    console.error('Error saving search:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route GET /api/search/saved
 * @desc Get user's saved searches
 * @access Private
 */
router.get('/saved', authenticate, async (req: any, res: Response) => {
  try {
    const { entity } = req.query;
    
    const searches = await AdvancedSearchService.getSavedSearches(
      req.user.id,
      req.user.companyId,
      entity as string
    );

    res.json(searches);
  } catch (error: any) {
    console.error('Error getting saved searches:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route PUT /api/search/saved/:id/use
 * @desc Update search usage count
 * @access Private
 */
router.put('/saved/:id/use', authenticate, async (req: any, res: Response) => {
  try {
    const searchId = parseInt(req.params.id);
    
    const updated = await AdvancedSearchService.updateSearchUsage(searchId);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating search usage:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route PUT /api/search/saved/:id/pin
 * @desc Toggle pin status of saved search
 * @access Private
 */
router.put('/saved/:id/pin', authenticate, async (req: any, res: Response) => {
  try {
    const searchId = parseInt(req.params.id);
    
    const updated = await AdvancedSearchService.togglePin(searchId, req.user.id);
    res.json(updated);
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route DELETE /api/search/saved/:id
 * @desc Delete a saved search
 * @access Private
 */
router.delete('/saved/:id', authenticate, async (req: any, res: Response) => {
  try {
    const searchId = parseInt(req.params.id);
    
    await AdvancedSearchService.deleteSavedSearch(searchId, req.user.id);
    res.json({ message: 'Search deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting search:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route GET /api/search/history
 * @desc Get search history
 * @access Private
 */
router.get('/history', authenticate, async (req: any, res: Response) => {
  try {
    const { entity, limit = 20 } = req.query;
    
    const history = await AdvancedSearchService.getSearchHistory(
      req.user.id,
      req.user.companyId,
      entity as string,
      parseInt(limit as string)
    );

    res.json(history);
  } catch (error: any) {
    console.error('Error getting search history:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

/**
 * @route DELETE /api/search/history
 * @desc Clear search history
 * @access Private
 */
router.delete('/history', authenticate, async (req: any, res: Response) => {
  try {
    await AdvancedSearchService.clearSearchHistory(req.user.id, req.user.companyId);
    res.json({ message: 'Search history cleared' });
  } catch (error: any) {
    console.error('Error clearing search history:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
