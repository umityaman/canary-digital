import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Multer configuration for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/inspections');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'inspection-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, WebP)'));
    }
  }
});

// GET /inspections - List all inspections
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { inspectionType, status, search, dateFrom, dateTo } = req.query;
    const companyId = req.companyId;

    const where: any = {
      order: { companyId }
    };

    if (inspectionType && inspectionType !== 'ALL') {
      where.inspectionType = inspectionType;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.inspectionDate = {};
      if (dateFrom) where.inspectionDate.gte = new Date(dateFrom as string);
      if (dateTo) where.inspectionDate.lte = new Date(dateTo as string);
    }

    if (search) {
      where.OR = [
        { notes: { contains: search as string } },
        { equipment: { name: { contains: search as string } } },
        { customer: { name: { contains: search as string } } }
      ];
    }

    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        equipment: true,
        customer: true,
        inspector: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        photos: true,
        damageReports: true
      },
      orderBy: { inspectionDate: 'desc' }
    });

    res.json(inspections);
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /inspections/:id - Get single inspection
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } },
      include: {
        equipment: true,
        customer: true,
        inspector: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        photos: true,
        damageReports: true
      }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    res.json(inspection);
  } catch (error) {
    console.error('Get inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inspections - Create new inspection
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      inspectionType,
      orderId,
      equipmentId,
      customerId,
      inspectorId,
      checklistData,
      overallCondition,
      customerSignature,
      inspectorSignature,
      notes,
      location,
      photos,
      damages
    } = req.body;

    const companyId = req.companyId;

    // Validate order
    const order = await prisma.order.findFirst({
      where: { id: orderId, companyId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Create inspection
    const inspection = await prisma.inspection.create({
      data: {
        inspectionType,
        orderId,
        equipmentId,
        customerId,
        inspectorId: inspectorId || req.userId,
        checklistData: checklistData ? JSON.stringify(checklistData) : null,
        overallCondition,
        customerSignature,
        inspectorSignature,
        notes,
        location,
        status: 'PENDING',
        inspectionDate: new Date()
      }
    });

    // Add photos
    if (photos && Array.isArray(photos) && photos.length > 0) {
      await prisma.inspectionPhoto.createMany({
        data: photos.map((photoUrl: string, index: number) => ({
          inspectionId: inspection.id,
          photoUrl,
          photoType: 'GENERAL',
          caption: `Photo ${index + 1}`
        }))
      });
    }

    // Add damages
    if (damages && Array.isArray(damages) && damages.length > 0) {
      await prisma.damageReport.createMany({
        data: damages.map((damage: any) => ({
          inspectionId: inspection.id,
          damageType: damage.damageType,
          severity: damage.severity,
          description: damage.description,
          location: damage.location || null,
          estimatedCost: damage.estimatedCost || 0,
          responsibleParty: damage.responsibleParty
        }))
      });
    }

    // Get complete inspection
    const completeInspection = await prisma.inspection.findUnique({
      where: { id: inspection.id },
      include: {
        equipment: true,
        customer: true,
        inspector: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        photos: true,
        damageReports: true
      }
    });

    res.status(201).json(completeInspection);
  } catch (error) {
    console.error('Create inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /inspections/:id - Update inspection
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, overallCondition, checklistData, customerSignature, inspectorSignature, notes } = req.body;
    const companyId = req.companyId;

    const existing = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    const inspection = await prisma.inspection.update({
      where: { id: parseInt(id) },
      data: {
        status,
        overallCondition,
        checklistData: checklistData ? JSON.stringify(checklistData) : undefined,
        customerSignature,
        inspectorSignature,
        notes
      },
      include: {
        equipment: true,
        customer: true,
        inspector: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        photos: true,
        damageReports: true
      }
    });

    res.json(inspection);
  } catch (error) {
    console.error('Update inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /inspections/:id - Delete inspection
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    await prisma.inspectionPhoto.deleteMany({ where: { inspectionId: parseInt(id) } });
    await prisma.damageReport.deleteMany({ where: { inspectionId: parseInt(id) } });
    await prisma.inspection.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Kontrol başarıyla silindi' });
  } catch (error) {
    console.error('Delete inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inspections/:id/photos - Add photo
router.post('/:id/photos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { photoUrl, photoType, caption } = req.body;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    const photo = await prisma.inspectionPhoto.create({
      data: {
        inspectionId: parseInt(id),
        photoUrl,
        photoType: photoType || 'GENERAL',
        caption
      }
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /inspections/:id/photos/:photoId - Delete photo
router.delete('/:id/photos/:photoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id, photoId } = req.params;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    await prisma.inspectionPhoto.delete({ where: { id: parseInt(photoId) } });
    res.json({ message: 'Fotoğraf silindi' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inspections/:id/damages - Add damage report
router.post('/:id/damages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { damageType, severity, description, location, estimatedCost, responsibleParty, photoUrl } = req.body;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    const damage = await prisma.damageReport.create({
      data: {
        inspectionId: parseInt(id),
        damageType,
        severity,
        description,
        location,
        estimatedCost: estimatedCost || 0,
        responsibleParty,
        photoUrl
      }
    });

    // Update status if critical damage
    if (severity === 'CRITICAL' || severity === 'MAJOR') {
      await prisma.inspection.update({
        where: { id: parseInt(id) },
        data: { status: 'DAMAGE_FOUND' }
      });
    }

    res.status(201).json(damage);
  } catch (error) {
    console.error('Add damage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /inspections/:id/damages/:damageId - Delete damage report
router.delete('/:id/damages/:damageId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id, damageId } = req.params;
    const companyId = req.companyId;

    const inspection = await prisma.inspection.findFirst({
      where: { id: parseInt(id), order: { companyId } }
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Kontrol bulunamadı' });
    }

    await prisma.damageReport.delete({ where: { id: parseInt(damageId) } });
    res.json({ message: 'Hasar raporu silindi' });
  } catch (error) {
    console.error('Delete damage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inspection-photos - Upload inspection photo (Mobile)
router.post('/inspection-photos', authenticateToken, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    const { inspectionId, equipmentId, orderId, type } = req.body;
    const file = req.file;
    const companyId = req.companyId;

    if (!file) {
      return res.status(400).json({ error: 'Fotoğraf bulunamadı' });
    }

    // Verify inspection belongs to company
    if (inspectionId) {
      const inspection = await prisma.inspection.findFirst({
        where: { id: parseInt(inspectionId), order: { companyId } }
      });

      if (!inspection) {
        // Delete uploaded file if inspection not found
        fs.unlinkSync(file.path);
        return res.status(404).json({ error: 'Kontrol bulunamadı' });
      }
    }

    // Create photo record
    const photo = await prisma.inspectionPhoto.create({
      data: {
        url: `/uploads/inspections/${file.filename}`,
        filename: file.filename,
        inspectionId: inspectionId ? parseInt(inspectionId) : null,
        equipmentId: equipmentId ? parseInt(equipmentId) : null,
        uploadedById: req.userId,
        notes: type || 'inspection' // pickup, return, damage, inspection
      }
    });

    res.status(201).json({
      message: 'Fotoğraf başarıyla yüklendi',
      photo: {
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        createdAt: photo.createdAt
      }
    });
  } catch (error: any) {
    console.error('Upload inspection photo error:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Fotoğraf yüklenirken bir hata oluştu' });
  }
});

// DELETE /inspection-photos/:id - Delete inspection photo
router.delete('/inspection-photos/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const photo = await prisma.inspectionPhoto.findFirst({
      where: { 
        id: parseInt(id),
        inspection: { order: { companyId } }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Fotoğraf bulunamadı' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.inspectionPhoto.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Fotoğraf silindi' });
  } catch (error) {
    console.error('Delete inspection photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
