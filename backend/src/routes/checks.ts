import express from 'express';
import { authenticateToken } from './auth';
import { log } from '../config/logger';
import { prisma } from '../index';

const router = express.Router();

/**
 * @route   GET /api/checks
 * @desc    Get all checks (Çek listesi)
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;
    const {
      type,
      status,
      startDate,
      endDate,
      search,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: any = { companyId };

    if (type) where.type = type as string;
    if (status) where.status = status as string;

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate as string);
      if (endDate) where.dueDate.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { checkNumber: { contains: search as string, mode: 'insensitive' } },
        { drawerName: { contains: search as string, mode: 'insensitive' } },
        { bankName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const checks = await prisma.check.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.check.count({ where });

    res.json({
      success: true,
      data: checks,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    log.error('Failed to fetch checks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch checks',
    });
  }
});

/**
 * @route   GET /api/checks/stats
 * @desc    Get check statistics (Çek istatistikleri)
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;

    const [
      receivedTotal,
      issuedTotal,
      portfolioCount,
      dueSoonCount,
      overdueCount,
    ] = await Promise.all([
      // Alınan çekler toplamı
      prisma.check.aggregate({
        where: { companyId, type: 'received', status: { in: ['portfolio', 'deposited'] } },
        _sum: { amount: true },
        _count: true,
      }),
      // Verilen çekler toplamı
      prisma.check.aggregate({
        where: { companyId, type: 'issued', status: { in: ['portfolio', 'deposited'] } },
        _sum: { amount: true },
        _count: true,
      }),
      // Portföydeki çekler
      prisma.check.count({
        where: { companyId, status: 'portfolio' },
      }),
      // Yaklaşan vadeler (30 gün içinde)
      prisma.check.count({
        where: {
          companyId,
          status: { in: ['portfolio', 'deposited'] },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Vadesi geçenler
      prisma.check.count({
        where: {
          companyId,
          status: { in: ['portfolio', 'deposited'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        receivedChecks: {
          amount: receivedTotal._sum.amount || 0,
          count: receivedTotal._count,
        },
        issuedChecks: {
          amount: issuedTotal._sum.amount || 0,
          count: issuedTotal._count,
        },
        portfolioCount,
        dueSoonCount,
        overdueCount,
      },
    });
  } catch (error: any) {
    log.error('Failed to get check stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get check stats',
    });
  }
});

/**
 * @route   POST /api/checks
 * @desc    Create new check (Yeni çek ekle)
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;
    const userId = req.user?.userId;

    const check = await prisma.check.create({
      data: {
        ...req.body,
        companyId,
        createdBy: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to create check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create check',
    });
  }
});

/**
 * @route   PUT /api/checks/:id
 * @desc    Update check (Çek güncelle)
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    // Check ownership
    const existing = await prisma.check.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Check not found',
      });
    }

    const check = await prisma.check.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to update check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update check',
    });
  }
});

/**
 * @route   DELETE /api/checks/:id
 * @desc    Delete check (Çek sil)
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    // Check ownership
    const existing = await prisma.check.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Check not found',
      });
    }

    await prisma.check.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Check deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete check',
    });
  }
});

/**
 * @route   POST /api/checks/:id/endorse
 * @desc    Endorse check (Çek ciro et)
 * @access  Private
 */
router.post('/:id/endorse', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { endorsedTo } = req.body;
    const companyId = req.user?.companyId || 1;

    if (!endorsedTo) {
      return res.status(400).json({
        success: false,
        message: 'endorsedTo is required',
      });
    }

    const check = await prisma.check.update({
      where: { id: parseInt(id) },
      data: {
        status: 'endorsed',
        endorsedTo,
        endorsedDate: new Date(),
        location: 'Ciroda',
      },
    });

    res.json({
      success: true,
      data: check,
      message: 'Check endorsed successfully',
    });
  } catch (error: any) {
    log.error('Failed to endorse check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to endorse check',
    });
  }
});

/**
 * @route   POST /api/checks/:id/deposit
 * @desc    Deposit check to bank (Çeki bankaya yatır)
 * @access  Private
 */
router.post('/:id/deposit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const check = await prisma.check.update({
      where: { id: parseInt(id) },
      data: {
        status: 'deposited',
        depositedDate: new Date(),
        location: 'Bankada',
      },
    });

    res.json({
      success: true,
      data: check,
      message: 'Check deposited successfully',
    });
  } catch (error: any) {
    log.error('Failed to deposit check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deposit check',
    });
  }
});

/**
 * @route   POST /api/checks/:id/cash
 * @desc    Mark check as cashed (Çek tahsil edildi)
 * @access  Private
 */
router.post('/:id/cash', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const check = await prisma.check.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cashed',
        cashedDate: new Date(),
        location: 'Tahsil Edildi',
      },
    });

    res.json({
      success: true,
      data: check,
      message: 'Check cashed successfully',
    });
  } catch (error: any) {
    log.error('Failed to cash check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cash check',
    });
  }
});

/**
 * @route   POST /api/checks/:id/bounce
 * @desc    Mark check as bounced (Çek karşılıksız)
 * @access  Private
 */
router.post('/:id/bounce', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { bouncedReason } = req.body;

    const check = await prisma.check.update({
      where: { id: parseInt(id) },
      data: {
        status: 'bounced',
        bouncedDate: new Date(),
        bouncedReason: bouncedReason || 'Karşılıksız',
        location: 'İade',
      },
    });

    res.json({
      success: true,
      data: check,
      message: 'Check marked as bounced',
    });
  } catch (error: any) {
    log.error('Failed to mark check as bounced:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark check as bounced',
    });
  }
});

export default router;
