import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Helper: Generate barcode from equipment ID
function generateBarcode(equipmentId: number): string {
  return `EQ${String(equipmentId).padStart(8, '0')}`;
}

// Helper: Generate QR code data
function generateQRCodeData(equipment: any): string {
  return JSON.stringify({
    type: 'equipment',
    id: equipment.id,
    name: equipment.name,
    serialNumber: equipment.serialNumber,
    url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/equipment/${equipment.id}`,
    timestamp: new Date().toISOString()
  });
}

// Helper: Parse scanned code (QR or Barcode)
function parseScannedCode(code: string): { type: 'QR' | 'BARCODE', equipmentId: number | null } {
  try {
    // Try parsing as JSON (QR code)
    const parsed = JSON.parse(code);
    if (parsed.type === 'equipment' && parsed.id) {
      return { type: 'QR', equipmentId: parsed.id };
    }
  } catch {
    // Not JSON, try barcode format
    const barcodeMatch = code.match(/EQ(\d+)/);
    if (barcodeMatch) {
      return { type: 'BARCODE', equipmentId: parseInt(barcodeMatch[1]) };
    }
  }
  return { type: 'BARCODE', equipmentId: null };
}

// GET /api/scan/:code - Find equipment by QR code or barcode
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { type, equipmentId } = parseScannedCode(code);

    if (!equipmentId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Geçersiz QR kod veya barcode formatı' 
      });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                customer: true
              }
            }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        scanLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ekipman bulunamadı' 
      });
    }

    res.json({
      success: true,
      data: equipment,
      scanType: type
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Tarama işlemi başarısız', 
      error: error.message 
    });
  }
});

// POST /api/scan - Log a scan event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      scannedCode, 
      scanAction,
      scannedBy,
      location,
      deviceInfo,
      notes,
      companyId 
    } = req.body;

    if (!scannedCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scanned code gerekli' 
      });
    }

    const { type, equipmentId } = parseScannedCode(scannedCode);

    if (!equipmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz QR kod veya barcode' 
      });
    }

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ekipman bulunamadı' 
      });
    }

    // Get IP and user agent from request
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Create scan log
    const scanLog = await prisma.scanLog.create({
      data: {
        equipmentId,
        scannedCode,
        scanType: type,
        scanAction: scanAction || 'VIEW',
        scannedBy,
        location,
        deviceInfo,
        ipAddress,
        userAgent,
        notes,
        companyId
      }
    });

    res.json({
      success: true,
      data: scanLog,
      equipment: {
        id: equipment.id,
        name: equipment.name,
        status: equipment.status
      }
    });
  } catch (error: any) {
    console.error('Scan log error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Tarama kaydı oluşturulamadı', 
      error: error.message 
    });
  }
});

// GET /api/scan/equipment/:id/history - Get scan history for equipment
router.get('/equipment/:id/history', async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [scanLogs, total] = await Promise.all([
      prisma.scanLog.findMany({
        where: { equipmentId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.scanLog.count({
        where: { equipmentId }
      })
    ]);

    res.json({
      success: true,
      data: scanLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error: any) {
    console.error('Scan history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Tarama geçmişi alınamadı', 
      error: error.message 
    });
  }
});

// POST /api/scan/generate-codes - Generate QR/Barcode for equipment
router.post('/generate-codes', async (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.body;

    if (!equipmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Equipment ID gerekli' 
      });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ekipman bulunamadı' 
      });
    }

    // Generate barcode if not exists
    const barcode = equipment.barcode || generateBarcode(equipment.id);
    
    // Generate QR code data
    const qrCode = equipment.qrCode || generateQRCodeData(equipment);

    // Update equipment with codes
    const updatedEquipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        barcode,
        qrCode
      }
    });

    res.json({
      success: true,
      data: {
        equipmentId: updatedEquipment.id,
        equipmentName: updatedEquipment.name,
        barcode: updatedEquipment.barcode,
        qrCode: updatedEquipment.qrCode,
        qrCodeData: generateQRCodeData(updatedEquipment)
      }
    });
  } catch (error: any) {
    console.error('Generate codes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kod oluşturma başarısız', 
      error: error.message 
    });
  }
});

// POST /api/scan/generate-batch - Generate codes for multiple equipment
router.post('/generate-batch', async (req: Request, res: Response) => {
  try {
    const { equipmentIds } = req.body;

    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Equipment IDs array gerekli' 
      });
    }

    const results = [];
    const errors = [];

    for (const id of equipmentIds) {
      try {
        const equipment = await prisma.equipment.findUnique({
          where: { id }
        });

        if (!equipment) {
          errors.push({ id, error: 'Ekipman bulunamadı' });
          continue;
        }

        const barcode = equipment.barcode || generateBarcode(equipment.id);
        const qrCode = equipment.qrCode || generateQRCodeData(equipment);

        const updated = await prisma.equipment.update({
          where: { id },
          data: { barcode, qrCode }
        });

        results.push({
          id: updated.id,
          name: updated.name,
          barcode: updated.barcode,
          qrCode: updated.qrCode
        });
      } catch (err: any) {
        errors.push({ id, error: err.message });
      }
    }

    res.json({
      success: true,
      data: results,
      errors,
      summary: {
        total: equipmentIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error: any) {
    console.error('Batch generate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Toplu kod oluşturma başarısız', 
      error: error.message 
    });
  }
});

// GET /api/scan/stats - Get scan statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, equipmentId, companyId } = req.query;

    const whereClause: any = {};
    
    if (equipmentId) {
      whereClause.equipmentId = parseInt(equipmentId as string);
    }
    
    if (companyId) {
      whereClause.companyId = parseInt(companyId as string);
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [totalScans, scansByType, scansByAction, recentScans] = await Promise.all([
      prisma.scanLog.count({ where: whereClause }),
      prisma.scanLog.groupBy({
        by: ['scanType'],
        where: whereClause,
        _count: true
      }),
      prisma.scanLog.groupBy({
        by: ['scanAction'],
        where: whereClause,
        _count: true
      }),
      prisma.scanLog.findMany({
        where: whereClause,
        include: {
          equipment: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        totalScans,
        scansByType,
        scansByAction,
        recentScans
      }
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İstatistikler alınamadı', 
      error: error.message 
    });
  }
});

export default router;
