import {Router, Request, Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Tüm ekipmanları listele
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, search } = req.query;
    const companyId = req.companyId;

    const where: any = { companyId };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { brand: { contains: search as string } },
        { model: { contains: search as string } },
        { serialNumber: { contains: search as string } }
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// QR/Barkod ile ekipman ara (scan endpoint)
router.get('/scan/:code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const companyId = req.companyId;

    // QR kodu veya barkod ile ara
    const equipment = await prisma.equipment.findFirst({
      where: { 
        companyId,
        OR: [
          { qrCode: code },
          { barcode: code },
          { code: code },
          { serialNumber: code }
        ]
      },
      include: {
        orderItems: {
          where: {
            order: {
              status: {
                in: ['PENDING', 'CONFIRMED', 'ACTIVE']
              }
            }
          },
          include: {
            order: {
              include: {
                customer: {
                  select: {
                    name: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: {
              createdAt: 'desc'
            }
          },
          take: 1
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ 
        error: 'Equipment not found',
        message: 'Bu QR kodu veya barkod ile eşleşen ekipman bulunamadı.' 
      });
    }

    // Log scan event (opsiyonel - daha sonra scan_logs tablosu eklenebilir)
    console.log(`Equipment scanned: ${equipment.code} (${equipment.name}) by user ${req.userId}`);

    res.json(equipment);
  } catch (error) {
    console.error('Equipment scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tekil ekipman getir
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const equipment = await prisma.equipment.findFirst({
      where: { 
        id: parseInt(id),
        companyId 
      },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                customer: true,
                payments: true
              }
            }
          },
          orderBy: {
            order: {
              createdAt: 'desc'
            }
          }
        },
        inspections: {
          include: {
            inspector: {
              select: {
                name: true,
                email: true
              }
            },
            customer: {
              select: {
                name: true,
                email: true
              }
            },
            photos: true,
            damageReports: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Yeni ekipman ekle
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      brand,
      model,
      category,
      serialNumber,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Equipment name is required' });
    }

    const companyId = req.companyId;

    // QR kod oluştur (basit format)
    const qrCode = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        brand,
        model,
        category,
        serialNumber,
        qrCode,
        dailyPrice: dailyPrice ? parseFloat(dailyPrice) : null,
        weeklyPrice: weeklyPrice ? parseFloat(weeklyPrice) : null,
        monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
        description,
        companyId
      }
    });

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'QR code already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Ekipman güncelle
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    // Ekipman var mı ve şirkete ait mi kontrol et
    const existingEquipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json({
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ekipman sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    // Ekipman var mı ve şirkete ait mi kontrol et
    const existingEquipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await prisma.equipment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ekipman kategorileri
router.get('/categories/list', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const categories = await prisma.equipment.findMany({
      where: { companyId, category: { not: null } },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    res.json(categoryList);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
