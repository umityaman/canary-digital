import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/accounting/tags - Get all tags for company
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const tags = await prisma.accountingTag.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    res.json(tags);
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch tags' });
  }
});

/**
 * POST /api/accounting/tags - Create a new tag
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    // Check if tag with same name already exists
    const existing = await prisma.accountingTag.findFirst({
      where: {
        companyId,
        name,
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Tag with this name already exists' });
    }

    const tag = await prisma.accountingTag.create({
      data: {
        companyId,
        name,
        color: color || '#3B82F6',
      },
    });

    res.status(201).json(tag);
  } catch (error: any) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: error.message || 'Failed to create tag' });
  }
});

/**
 * PUT /api/accounting/tags/:id - Update a tag
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const tagId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { name, color } = req.body;

    // Verify tag belongs to company
    const existingTag = await prisma.accountingTag.findFirst({
      where: { id: tagId, companyId },
    });

    if (!existingTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Check if new name conflicts with another tag
    if (name && name !== existingTag.name) {
      const duplicate = await prisma.accountingTag.findFirst({
        where: {
          companyId,
          name,
          id: { not: tagId },
        },
      });

      if (duplicate) {
        return res.status(400).json({ message: 'Tag with this name already exists' });
      }
    }

    const tag = await prisma.accountingTag.update({
      where: { id: tagId },
      data: {
        name: name || existingTag.name,
        color: color || existingTag.color,
      },
    });

    res.json(tag);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: error.message || 'Failed to update tag' });
  }
});

/**
 * DELETE /api/accounting/tags/:id - Delete a tag
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const tagId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Verify tag belongs to company
    const existingTag = await prisma.accountingTag.findFirst({
      where: { id: tagId, companyId },
    });

    if (!existingTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await prisma.accountingTag.delete({
      where: { id: tagId },
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: error.message || 'Failed to delete tag' });
  }
});

export default router;
