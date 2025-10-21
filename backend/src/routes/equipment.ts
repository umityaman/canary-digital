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

    // Son ekipmanın ID'sini bul
    const lastEquipment = await prisma.equipment.findFirst({
      where: { companyId },
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    // Sıralı ekipman kodu oluştur (EQP-0001, EQP-0002, vs.)
    const nextNumber = lastEquipment ? lastEquipment.id + 1 : 1;
    const equipmentCode = `EQP-${String(nextNumber).padStart(4, '0')}`;

    // QR kod oluştur
    const qrCode = `${equipmentCode}-${Date.now().toString(36).toUpperCase()}`;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        brand,
        model,
        category,
        serialNumber,
        code: equipmentCode,  // Otomatik sıralı kod
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
      res.status(400).json({ error: 'Equipment code already exists' });
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

// Ekipman kiralama geçmişi (müsaitlik takvimi için)
router.get('/:id/rentals', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.companyId;

    // Ekipmanın varlığını kontrol et
    const equipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const where: any = {
      equipmentId: parseInt(id),
      order: {
        companyId
      }
    };

    // Tarih filtresi varsa ekle
    if (startDate || endDate) {
      where.OR = [
        {
          order: {
            pickupDate: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined
            }
          }
        },
        {
          order: {
            returnDate: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined
            }
          }
        }
      ];
    }

    const rentals = await prisma.orderItem.findMany({
      where,
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
          pickupDate: 'asc'
        }
      }
    });

    // Frontend için uygun formata dönüştür
    const formattedRentals = rentals.map(item => ({
      id: item.id,
      orderNumber: item.order.orderNumber,
      customerName: item.order.customer?.name || 'N/A',
      pickupDate: item.order.pickupDate,
      returnDate: item.order.returnDate,
      status: item.order.status
    }));

    res.json(formattedRentals);
  } catch (error) {
    console.error('Get equipment rentals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ekipman bakım planı (müsaitlik takvimi için)
router.get('/:id/maintenance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.companyId;

    // Ekipmanın varlığını kontrol et
    const equipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Şimdilik boş array döndür - ileride maintenance tablosu eklenebilir
    // TODO: Maintenance scheduling feature
    res.json([]);
  } catch (error) {
    console.error('Get equipment maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
