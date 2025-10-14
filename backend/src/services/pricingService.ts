import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PriceCalculationParams {
  equipmentId: number;
  startDate: Date;
  endDate: Date;
  quantity?: number;
  promoCode?: string;
}

interface PriceBreakdown {
  basePrice: number;
  durationDays: number;
  durationHours: number;
  quantity: number;
  subtotal: number;
  discounts: Array<{
    name: string;
    type: string;
    amount: number;
    appliedRule?: string;
  }>;
  totalDiscount: number;
  finalPrice: number;
  pricePerDay: number;
  appliedRules: string[];
}

export class PricingService {
  /**
   * Calculate price for equipment rental
   */
  static async calculatePrice(params: PriceCalculationParams): Promise<PriceBreakdown> {
    const { equipmentId, startDate, endDate, quantity = 1, promoCode } = params;

    // Get equipment with pricing rules
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        pricingRules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }, // Higher priority first
        },
      },
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    // Calculate duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationHours / 24);

    // Base price calculation
    let basePrice = this.calculateBasePrice(equipment, durationDays, durationHours);
    let subtotal = basePrice * quantity;

    const discounts: Array<any> = [];
    const appliedRules: string[] = [];

    // Apply pricing rules
    for (const rule of equipment.pricingRules) {
      const discount = await this.applyPricingRule(rule, {
        durationDays,
        durationHours,
        quantity,
        startDate,
        endDate,
        subtotal,
      });

      if (discount) {
        discounts.push(discount);
        appliedRules.push(rule.name);
      }
    }

    // Apply promo code if provided
    if (promoCode) {
      const promoDiscount = await this.applyPromoCode(promoCode, subtotal, equipmentId);
      if (promoDiscount) {
        discounts.push(promoDiscount);
      }
    }

    // Calculate totals
    const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
    const finalPrice = Math.max(0, subtotal - totalDiscount);
    const pricePerDay = durationDays > 0 ? finalPrice / durationDays : finalPrice;

    return {
      basePrice,
      durationDays,
      durationHours,
      quantity,
      subtotal,
      discounts,
      totalDiscount,
      finalPrice,
      pricePerDay,
      appliedRules,
    };
  }

  /**
   * Calculate base price based on equipment pricing
   */
  private static calculateBasePrice(equipment: any, days: number, hours: number): number {
    // Hourly pricing (if rental < 24 hours and hourly price exists)
    if (hours < 24 && equipment.hourlyPrice) {
      return equipment.hourlyPrice * hours;
    }

    // Monthly pricing (if rental >= 30 days and monthly price exists)
    if (days >= 30 && equipment.monthlyPrice) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      const monthlyTotal = months * equipment.monthlyPrice;
      const dailyTotal = remainingDays * (equipment.dailyPrice || 0);
      return monthlyTotal + dailyTotal;
    }

    // Weekly pricing (if rental >= 7 days and weekly price exists)
    if (days >= 7 && equipment.weeklyPrice) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      const weeklyTotal = weeks * equipment.weeklyPrice;
      const dailyTotal = remainingDays * (equipment.dailyPrice || 0);
      return weeklyTotal + dailyTotal;
    }

    // Daily pricing (default)
    return (equipment.dailyPrice || 0) * days;
  }

  /**
   * Apply a pricing rule and calculate discount
   */
  private static async applyPricingRule(
    rule: any,
    context: {
      durationDays: number;
      durationHours: number;
      quantity: number;
      startDate: Date;
      endDate: Date;
      subtotal: number;
    }
  ): Promise<any | null> {
    // Check if rule is within date range
    if (rule.startDate && rule.endDate) {
      if (context.startDate < rule.startDate || context.endDate > rule.endDate) {
        return null; // Rule not applicable for this date range
      }
    }

    // Check duration constraints
    if (rule.minDuration && context.durationDays < rule.minDuration) {
      return null;
    }
    if (rule.maxDuration && context.durationDays > rule.maxDuration) {
      return null;
    }

    // Check quantity constraints
    if (rule.minQuantity && context.quantity < rule.minQuantity) {
      return null;
    }
    if (rule.maxQuantity && context.quantity > rule.maxQuantity) {
      return null;
    }

    // Check usage limits
    if (rule.maxUsage && rule.currentUsage >= rule.maxUsage) {
      return null;
    }

    // Calculate discount
    let discountAmount = 0;

    if (rule.discountType === 'PERCENTAGE') {
      discountAmount = (context.subtotal * (rule.discountValue || 0)) / 100;
    } else if (rule.discountType === 'FIXED_AMOUNT') {
      discountAmount = rule.discountValue || 0;
    } else if (rule.discountType === 'SPECIAL_RATE' && rule.pricePerUnit) {
      // Use special rate instead of default pricing
      const specialPrice = rule.pricePerUnit * context.durationDays * context.quantity;
      discountAmount = context.subtotal - specialPrice;
    }

    if (discountAmount > 0) {
      // Update usage count
      await prisma.pricingRule.update({
        where: { id: rule.id },
        data: { currentUsage: { increment: 1 } },
      });

      return {
        name: rule.name,
        type: rule.discountType,
        amount: discountAmount,
        appliedRule: rule.ruleType,
      };
    }

    return null;
  }

  /**
   * Apply promo code discount
   */
  private static async applyPromoCode(
    code: string,
    subtotal: number,
    equipmentId: number
  ): Promise<any | null> {
    const promoCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode || !promoCode.isActive) {
      return null;
    }

    // Check validity dates
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validTo) {
      return null;
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotal < promoCode.minOrderAmount) {
      return null;
    }

    // Check usage limits
    if (promoCode.maxUsage && promoCode.currentUsage >= promoCode.maxUsage) {
      return null;
    }

    // Check if applicable to this equipment
    if (promoCode.appliesTo === 'SPECIFIC_ITEMS') {
      const equipmentIds = JSON.parse(promoCode.equipmentIds || '[]');
      if (!equipmentIds.includes(equipmentId)) {
        return null;
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else if (promoCode.discountType === 'FIXED_AMOUNT') {
      discountAmount = promoCode.discountValue;
    }

    if (discountAmount > 0) {
      // Update usage count
      await prisma.discountCode.update({
        where: { id: promoCode.id },
        data: {
          currentUsage: { increment: 1 },
          usageCount: { increment: 1 },
        },
      });

      return {
        name: `Promo Code: ${code}`,
        type: promoCode.discountType,
        amount: discountAmount,
      };
    }

    return null;
  }

  /**
   * Get all active pricing rules for equipment
   */
  static async getPricingRules(equipmentId: number) {
    return await prisma.pricingRule.findMany({
      where: {
        equipmentId,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * Create a new pricing rule
   */
  static async createPricingRule(data: any) {
    return await prisma.pricingRule.create({
      data,
    });
  }

  /**
   * Update pricing rule
   */
  static async updatePricingRule(id: number, data: any) {
    return await prisma.pricingRule.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete pricing rule
   */
  static async deletePricingRule(id: number) {
    return await prisma.pricingRule.delete({
      where: { id },
    });
  }

  /**
   * Create discount code
   */
  static async createDiscountCode(data: any) {
    return await prisma.discountCode.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  }

  /**
   * Validate discount code
   */
  static async validateDiscountCode(code: string): Promise<{
    valid: boolean;
    code?: any;
    reason?: string;
  }> {
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      return { valid: false, reason: 'Kod bulunamadı' };
    }

    if (!discountCode.isActive) {
      return { valid: false, reason: 'Kod aktif değil' };
    }

    const now = new Date();
    if (now < discountCode.validFrom) {
      return { valid: false, reason: 'Kod henüz geçerli değil' };
    }

    if (now > discountCode.validTo) {
      return { valid: false, reason: 'Kod süresi dolmuş' };
    }

    if (discountCode.maxUsage && discountCode.currentUsage >= discountCode.maxUsage) {
      return { valid: false, reason: 'Kod kullanım limiti dolmuş' };
    }

    return { valid: true, code: discountCode };
  }

  /**
   * Create equipment bundle
   */
  static async createBundle(data: any, items: Array<{ equipmentId: number; quantity: number }>) {
    const bundle = await prisma.equipmentBundle.create({
      data: {
        ...data,
        bundleItems: {
          create: items.map((item, index) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            displayOrder: index,
          })),
        },
      },
      include: {
        bundleItems: {
          include: {
            equipment: true,
          },
        },
      },
    });

    return bundle;
  }

  /**
   * Calculate bundle savings
   */
  static async calculateBundleSavings(bundleId: number): Promise<{
    bundlePrice: number;
    originalPrice: number;
    savings: number;
    savingsPercent: number;
  }> {
    const bundle = await prisma.equipmentBundle.findUnique({
      where: { id: bundleId },
      include: {
        bundleItems: {
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!bundle) {
      throw new Error('Bundle not found');
    }

    // Calculate original price (sum of all items)
    const originalPrice = bundle.bundleItems.reduce((sum, item) => {
      const price = item.equipment.dailyPrice || 0;
      return sum + price * item.quantity;
    }, 0);

    const savings = originalPrice - bundle.bundlePrice;
    const savingsPercent = originalPrice > 0 ? (savings / originalPrice) * 100 : 0;

    return {
      bundlePrice: bundle.bundlePrice,
      originalPrice,
      savings,
      savingsPercent: Math.round(savingsPercent * 100) / 100,
    };
  }

  /**
   * Record price change in history
   */
  static async recordPriceChange(
    equipmentId: number,
    oldPrices: { daily?: number; weekly?: number; monthly?: number },
    newPrices: { daily?: number; weekly?: number; monthly?: number },
    reason?: string,
    changedBy?: string
  ) {
    // Calculate percentage change (using daily price)
    let changePercent = 0;
    if (oldPrices.daily && newPrices.daily) {
      changePercent = ((newPrices.daily - oldPrices.daily) / oldPrices.daily) * 100;
    }

    return await prisma.priceHistory.create({
      data: {
        equipmentId,
        oldDailyPrice: oldPrices.daily,
        oldWeeklyPrice: oldPrices.weekly,
        oldMonthlyPrice: oldPrices.monthly,
        newDailyPrice: newPrices.daily,
        newWeeklyPrice: newPrices.weekly,
        newMonthlyPrice: newPrices.monthly,
        changeReason: reason,
        changePercent: Math.round(changePercent * 100) / 100,
        changedBy,
      },
    });
  }

  /**
   * Get price history for equipment
   */
  static async getPriceHistory(equipmentId: number, limit: number = 10) {
    return await prisma.priceHistory.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export default PricingService;
