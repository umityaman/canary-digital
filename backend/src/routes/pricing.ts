import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PricingService from '../services/pricingService';

const router = Router();
const prisma = new PrismaClient();

// POST /api/pricing/calculate - Calculate price for rental
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { equipmentId, startDate, endDate, quantity, promoCode } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, start date, and end date are required',
      });
    }

    const priceBreakdown = await PricingService.calculatePrice({
      equipmentId: parseInt(equipmentId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity: quantity ? parseInt(quantity) : 1,
      promoCode,
    });

    res.json({
      success: true,
      data: priceBreakdown,
    });
  } catch (error: any) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat hesaplanamadı',
      error: error.message,
    });
  }
});

// GET /api/pricing/rules/:equipmentId - Get pricing rules for equipment
router.get('/rules/:equipmentId', async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.equipmentId);

    const rules = await PricingService.getPricingRules(equipmentId);

    res.json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    console.error('Get pricing rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyatlandırma kuralları alınamadı',
      error: error.message,
    });
  }
});

// POST /api/pricing/rules - Create pricing rule
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const rule = await PricingService.createPricingRule(req.body);

    res.json({
      success: true,
      data: rule,
      message: 'Fiyatlandırma kuralı oluşturuldu',
    });
  } catch (error: any) {
    console.error('Create pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyatlandırma kuralı oluşturulamadı',
      error: error.message,
    });
  }
});

// PUT /api/pricing/rules/:id - Update pricing rule
router.put('/rules/:id', async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);

    const rule = await PricingService.updatePricingRule(ruleId, req.body);

    res.json({
      success: true,
      data: rule,
      message: 'Fiyatlandırma kuralı güncellendi',
    });
  } catch (error: any) {
    console.error('Update pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyatlandırma kuralı güncellenemedi',
      error: error.message,
    });
  }
});

// DELETE /api/pricing/rules/:id - Delete pricing rule
router.delete('/rules/:id', async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);

    await PricingService.deletePricingRule(ruleId);

    res.json({
      success: true,
      message: 'Fiyatlandırma kuralı silindi',
    });
  } catch (error: any) {
    console.error('Delete pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyatlandırma kuralı silinemedi',
      error: error.message,
    });
  }
});

// GET /api/pricing/discounts - Get all discount codes
router.get('/discounts', async (req: Request, res: Response) => {
  try {
    const { isActive, validNow } = req.query;

    const whereClause: any = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (validNow === 'true') {
      const now = new Date();
      whereClause.validFrom = { lte: now };
      whereClause.validTo = { gte: now };
    }

    const discounts = await prisma.discountCode.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: discounts,
    });
  } catch (error: any) {
    console.error('Get discounts error:', error);
    res.status(500).json({
      success: false,
      message: 'İndirim kodları alınamadı',
      error: error.message,
    });
  }
});

// POST /api/pricing/discounts - Create discount code
router.post('/discounts', async (req: Request, res: Response) => {
  try {
    const discountCode = await PricingService.createDiscountCode(req.body);

    res.json({
      success: true,
      data: discountCode,
      message: 'İndirim kodu oluşturuldu',
    });
  } catch (error: any) {
    console.error('Create discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'İndirim kodu oluşturulamadı',
      error: error.message,
    });
  }
});

// POST /api/pricing/discounts/validate - Validate discount code
router.post('/discounts/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Kod gerekli',
      });
    }

    const validation = await PricingService.validateDiscountCode(code);

    res.json({
      success: validation.valid,
      data: validation.code,
      message: validation.valid ? 'Kod geçerli' : validation.reason,
    });
  } catch (error: any) {
    console.error('Validate discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Kod doğrulanamadı',
      error: error.message,
    });
  }
});

// GET /api/pricing/bundles - Get all equipment bundles
router.get('/bundles', async (req: Request, res: Response) => {
  try {
    const { isActive, category } = req.query;

    const whereClause: any = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (category) {
      whereClause.category = category;
    }

    const bundles = await prisma.equipmentBundle.findMany({
      where: whereClause,
      include: {
        bundleItems: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                dailyPrice: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: bundles,
    });
  } catch (error: any) {
    console.error('Get bundles error:', error);
    res.status(500).json({
      success: false,
      message: 'Paketler alınamadı',
      error: error.message,
    });
  }
});

// GET /api/pricing/bundles/:id - Get bundle details
router.get('/bundles/:id', async (req: Request, res: Response) => {
  try {
    const bundleId = parseInt(req.params.id);

    const bundle = await prisma.equipmentBundle.findUnique({
      where: { id: bundleId },
      include: {
        bundleItems: {
          include: {
            equipment: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı',
      });
    }

    // Calculate savings
    const savings = await PricingService.calculateBundleSavings(bundleId);

    res.json({
      success: true,
      data: {
        ...bundle,
        savings,
      },
    });
  } catch (error: any) {
    console.error('Get bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Paket alınamadı',
      error: error.message,
    });
  }
});

// POST /api/pricing/bundles - Create equipment bundle
router.post('/bundles', async (req: Request, res: Response) => {
  try {
    const { items, ...bundleData } = req.body;

    if (!items || items.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'En az 2 ekipman gerekli',
      });
    }

    const bundle = await PricingService.createBundle(bundleData, items);

    res.json({
      success: true,
      data: bundle,
      message: 'Paket oluşturuldu',
    });
  } catch (error: any) {
    console.error('Create bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Paket oluşturulamadı',
      error: error.message,
    });
  }
});

// PUT /api/pricing/bundles/:id - Update equipment bundle
router.put('/bundles/:id', async (req: Request, res: Response) => {
  try {
    const bundleId = parseInt(req.params.id);

    const bundle = await prisma.equipmentBundle.update({
      where: { id: bundleId },
      data: req.body,
    });

    res.json({
      success: true,
      data: bundle,
      message: 'Paket güncellendi',
    });
  } catch (error: any) {
    console.error('Update bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Paket güncellenemedi',
      error: error.message,
    });
  }
});

// DELETE /api/pricing/bundles/:id - Delete equipment bundle
router.delete('/bundles/:id', async (req: Request, res: Response) => {
  try {
    const bundleId = parseInt(req.params.id);

    await prisma.equipmentBundle.delete({
      where: { id: bundleId },
    });

    res.json({
      success: true,
      message: 'Paket silindi',
    });
  } catch (error: any) {
    console.error('Delete bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Paket silinemedi',
      error: error.message,
    });
  }
});

// GET /api/pricing/history/:equipmentId - Get price history
router.get('/history/:equipmentId', async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.equipmentId);
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await PricingService.getPriceHistory(equipmentId, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Get price history error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat geçmişi alınamadı',
      error: error.message,
    });
  }
});

// POST /api/pricing/history - Record price change
router.post('/history', async (req: Request, res: Response) => {
  try {
    const { equipmentId, oldPrices, newPrices, reason, changedBy } = req.body;

    if (!equipmentId || !oldPrices || !newPrices) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, old prices, and new prices are required',
      });
    }

    const history = await PricingService.recordPriceChange(
      parseInt(equipmentId),
      oldPrices,
      newPrices,
      reason,
      changedBy
    );

    res.json({
      success: true,
      data: history,
      message: 'Fiyat değişikliği kaydedildi',
    });
  } catch (error: any) {
    console.error('Record price change error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat değişikliği kaydedilemedi',
      error: error.message,
    });
  }
});

// GET /api/pricing/stats - Get pricing statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = parseInt(companyId as string);
    }

    const [
      totalRules,
      activeRules,
      totalDiscounts,
      activeDiscounts,
      totalBundles,
      activeBundles,
    ] = await Promise.all([
      prisma.pricingRule.count({ where: whereClause }),
      prisma.pricingRule.count({ where: { ...whereClause, isActive: true } }),
      prisma.discountCode.count({ where: whereClause }),
      prisma.discountCode.count({ where: { ...whereClause, isActive: true } }),
      prisma.equipmentBundle.count({ where: whereClause }),
      prisma.equipmentBundle.count({ where: { ...whereClause, isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        rules: {
          total: totalRules,
          active: activeRules,
        },
        discounts: {
          total: totalDiscounts,
          active: activeDiscounts,
        },
        bundles: {
          total: totalBundles,
          active: activeBundles,
        },
      },
    });
  } catch (error: any) {
    console.error('Get pricing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
      error: error.message,
    });
  }
});

export default router;
