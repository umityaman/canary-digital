import express from 'express';
import { authenticateToken } from './auth';
import { log } from '../config/logger';
import { prisma } from '../index';

const router = express.Router();

/**
 * @route   GET /api/promissory-notes
 * @desc    Get all promissory notes (Senet listesi)
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
        { noteNumber: { contains: search as string, mode: 'insensitive' } },
        { drawerName: { contains: search as string, mode: 'insensitive' } },
        { payeeName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.promissoryNote.findMany({
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

    const total = await prisma.promissoryNote.count({ where });

    res.json({
      success: true,
      data: notes,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    log.error('Failed to fetch promissory notes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch promissory notes',
    });
  }
});

/**
 * @route   GET /api/promissory-notes/stats
 * @desc    Get promissory note statistics (Senet istatistikleri)
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;

    const [
      receivableTotal,
      payableTotal,
      portfolioCount,
      dueSoonCount,
      overdueCount,
    ] = await Promise.all([
      // Alacak senetleri
      prisma.promissoryNote.aggregate({
        where: { companyId, type: 'receivable', status: { in: ['portfolio'] } },
        _sum: { amount: true },
        _count: true,
      }),
      // Borç senetleri
      prisma.promissoryNote.aggregate({
        where: { companyId, type: 'payable', status: { in: ['portfolio'] } },
        _sum: { amount: true },
        _count: true,
      }),
      // Portföydeki senetler
      prisma.promissoryNote.count({
        where: { companyId, status: 'portfolio' },
      }),
      // Yaklaşan vadeler (30 gün)
      prisma.promissoryNote.count({
        where: {
          companyId,
          status: 'portfolio',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Vadesi geçenler
      prisma.promissoryNote.count({
        where: {
          companyId,
          status: 'portfolio',
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        receivableNotes: {
          amount: receivableTotal._sum.amount || 0,
          count: receivableTotal._count,
        },
        payableNotes: {
          amount: payableTotal._sum.amount || 0,
          count: payableTotal._count,
        },
        portfolioCount,
        dueSoonCount,
        overdueCount,
      },
    });
  } catch (error: any) {
    log.error('Failed to get promissory note stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get promissory note stats',
    });
  }
});

/**
 * @route   POST /api/promissory-notes
 * @desc    Create new promissory note (Yeni senet ekle)
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;
    const userId = req.user?.userId;

    const note = await prisma.promissoryNote.create({
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
      data: note,
    });
  } catch (error: any) {
    log.error('Failed to create promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create promissory note',
    });
  }
});

/**
 * @route   PUT /api/promissory-notes/:id
 * @desc    Update promissory note (Senet güncelle)
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    const existing = await prisma.promissoryNote.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Promissory note not found',
      });
    }

    const note = await prisma.promissoryNote.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    log.error('Failed to update promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update promissory note',
    });
  }
});

/**
 * @route   DELETE /api/promissory-notes/:id
 * @desc    Delete promissory note (Senet sil)
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    const existing = await prisma.promissoryNote.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Promissory note not found',
      });
    }

    await prisma.promissoryNote.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Promissory note deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete promissory note',
    });
  }
});

/**
 * @route   POST /api/promissory-notes/:id/endorse
 * @desc    Endorse promissory note (Senet ciro et)
 * @access  Private
 */
router.post('/:id/endorse', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { endorsedTo } = req.body;

    if (!endorsedTo) {
      return res.status(400).json({
        success: false,
        message: 'endorsedTo is required',
      });
    }

    const note = await prisma.promissoryNote.update({
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
      data: note,
      message: 'Promissory note endorsed successfully',
    });
  } catch (error: any) {
    log.error('Failed to endorse promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to endorse promissory note',
    });
  }
});

/**
 * @route   POST /api/promissory-notes/:id/collect
 * @desc    Mark note as collected (Senet tahsil edildi)
 * @access  Private
 */
router.post('/:id/collect', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.promissoryNote.update({
      where: { id: parseInt(id) },
      data: {
        status: 'collected',
        collectedDate: new Date(),
        location: 'Tahsil Edildi',
      },
    });

    res.json({
      success: true,
      data: note,
      message: 'Promissory note collected successfully',
    });
  } catch (error: any) {
    log.error('Failed to collect promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to collect promissory note',
    });
  }
});

/**
 * @route   POST /api/promissory-notes/:id/default
 * @desc    Mark note as defaulted (Senet protestolu)
 * @access  Private
 */
router.post('/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { defaultReason } = req.body;

    const note = await prisma.promissoryNote.update({
      where: { id: parseInt(id) },
      data: {
        status: 'defaulted',
        defaultedDate: new Date(),
        defaultReason: defaultReason || 'Ödeme yapılmadı',
        location: 'Protestolu',
      },
    });

    res.json({
      success: true,
      data: note,
      message: 'Promissory note marked as defaulted',
    });
  } catch (error: any) {
    log.error('Failed to mark note as defaulted:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark note as defaulted',
    });
  }
});

export default router;
