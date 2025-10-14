import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categories - List all categories for company
router.get('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const categories = await prisma.category.findMany({
      where: {
        companyId: parseInt(companyId as string),
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`📂 Fetched ${categories.length} categories for company ${companyId}`);
    res.json(categories);
  } catch (error: any) {
    logger.error('❌ Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/all - List all categories including inactive
router.get('/all', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const categories = await prisma.category.findMany({
      where: {
        companyId: parseInt(companyId as string)
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`📂 Fetched ${categories.length} categories (all) for company ${companyId}`);
    res.json(categories);
  } catch (error: any) {
    logger.error('❌ Error fetching all categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { name, description, icon, color } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: {
        companyId: parseInt(companyId as string),
        name: name.trim()
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        companyId: parseInt(companyId as string),
        isActive: true
      }
    });

    logger.info(`✅ Created category: ${category.name} (ID: ${category.id})`);
    res.status(201).json(category);
  } catch (error: any) {
    logger.error('❌ Error creating category:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const categoryId = parseInt(req.params.id);
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const { name, description, icon, color, isActive } = req.body;

    // Check if category exists and belongs to company
    const existing = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: parseInt(companyId as string)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Validate name if provided
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'Category name cannot be empty' });
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.category.findFirst({
        where: {
          companyId: parseInt(companyId as string),
          name: name.trim(),
          id: { not: categoryId }
        }
      });

      if (duplicate) {
        return res.status(400).json({ error: 'A category with this name already exists' });
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(icon !== undefined && { icon: icon?.trim() || null }),
        ...(color !== undefined && { color: color?.trim() || null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`✏️ Updated category: ${category.name} (ID: ${category.id})`);
    res.json(category);
  } catch (error: any) {
    logger.error('❌ Error updating category:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const categoryId = parseInt(req.params.id);
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists and belongs to company
    const existing = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: parseInt(companyId as string)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category is in use by any equipment
    const equipmentCount = await prisma.equipment.count({
      where: {
        category: existing.name // Equipment uses category name as string
      }
    });

    if (equipmentCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It is currently used by ${equipmentCount} equipment item(s).`,
        inUse: true,
        equipmentCount
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    logger.info(`🗑️ Deleted category: ${existing.name} (ID: ${categoryId})`);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    logger.error('❌ Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// PATCH /api/categories/:id/toggle - Toggle category active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const categoryId = parseInt(req.params.id);
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists and belongs to company
    const existing = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: parseInt(companyId as string)
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Toggle active status
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !existing.isActive }
    });

    logger.info(`🔄 Toggled category status: ${category.name} (ID: ${category.id}) - isActive: ${category.isActive}`);
    res.json(category);
  } catch (error: any) {
    logger.error('❌ Error toggling category status:', error);
    res.status(500).json({ error: 'Failed to toggle category status' });
  }
});

export default router;
