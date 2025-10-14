import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Tüm müşterileri listele
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } },
        { company: { contains: search as string } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tekil müşteri getir
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                equipment: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Yeni müşteri ekle
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      company,
      taxNumber
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        taxNumber
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Müşteri güncelle
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      company,
      taxNumber
    } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        address,
        company,
        taxNumber
      }
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Müşteri sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: { orders: true }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Müşterinin siparişi varsa silme
    if (customer.orders.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders. Please delete orders first.' 
      });
    }

    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
