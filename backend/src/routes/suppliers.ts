import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  companyId?: number;
}

// Get all suppliers
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId || 1;
    
    const suppliers = await prisma.supplier.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).companyId || 1;

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id: parseInt(id),
        companyId 
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Create supplier
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { name, email, phone, address, contactPerson, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
        notes,
        companyId
      }
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Update supplier
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).companyId || 1;
    const { name, email, phone, address, contactPerson, notes } = req.body;

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id: parseInt(id),
        companyId 
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const updated = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
        notes
      }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).companyId || 1;

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id: parseInt(id),
        companyId 
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
