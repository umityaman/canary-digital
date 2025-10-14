import { PrismaClient } from '@prisma/client';
import PricingService from '../services/pricingService';

const prisma = new PrismaClient();

async function testPricingSystem() {
  try {
    console.log('🧪 Testing Pricing System...\n');

    // 1. Get first equipment
    const equipment = await prisma.equipment.findFirst({
      where: { status: 'AVAILABLE' },
    });

    if (!equipment) {
      console.log('❌ No equipment found');
      return;
    }

    console.log(`✅ Testing with: ${equipment.name} (ID: ${equipment.id})`);
    console.log(`   Daily Price: ${equipment.dailyPrice} TL\n`);

    // 2. Create a duration-based pricing rule (10% off for 7+ days)
    console.log('📋 Creating pricing rule (10% off for 7+ days)...');
    const rule = await PricingService.createPricingRule({
      name: 'Haftalık İndirim',
      description: '7 gün ve üzeri kiralamalar için %10 indirim',
      equipmentId: equipment.id,
      ruleType: 'DURATION',
      durationType: 'DAILY',
      minDuration: 7,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      priority: 1,
      isActive: true,
      isAutoApplied: true,
    });
    console.log(`✅ Rule created: ${rule.name} (ID: ${rule.id})\n`);

    // 3. Create a discount code
    console.log('🎟️  Creating discount code (WELCOME20)...');
    const discount = await PricingService.createDiscountCode({
      name: 'Hoş Geldin İndirimi',
      code: 'WELCOME20',
      description: 'Hoş geldin indirimi - İlk siparişinizde %20 indirim',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      appliesTo: 'ALL', // Applies to all items
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUsage: 100,
      isActive: true,
    });
    console.log(`✅ Discount code created: ${discount.code}\n`);

    // 4. Test price calculations
    console.log('💰 Testing price calculations:\n');

    // Test 1: 3 days rental (no rule applied)
    const price1 = await PricingService.calculatePrice({
      equipmentId: equipment.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      quantity: 1,
    });
    console.log('Test 1: 3 days rental');
    console.log(`  Base: ${price1.basePrice} TL`);
    console.log(`  Subtotal: ${price1.subtotal} TL`);
    console.log(`  Discounts: ${price1.totalDiscount} TL`);
    console.log(`  Final Price: ${price1.finalPrice} TL`);
    console.log(`  Applied rules: ${price1.appliedRules.length}\n`);

    // Test 2: 10 days rental (rule applied)
    const price2 = await PricingService.calculatePrice({
      equipmentId: equipment.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      quantity: 1,
    });
    console.log('Test 2: 10 days rental (should apply 10% discount)');
    console.log(`  Base: ${price2.basePrice} TL`);
    console.log(`  Subtotal: ${price2.subtotal} TL`);
    console.log(`  Discounts: ${price2.totalDiscount} TL`);
    console.log(`  Final Price: ${price2.finalPrice} TL`);
    console.log(`  Applied rules: ${price2.appliedRules.length}`);
    if (price2.appliedRules.length > 0) {
      price2.appliedRules.forEach((rule: string) => {
        console.log(`    - ${rule}`);
      });
    }
    console.log();

    // Test 3: 5 days rental with promo code
    const price3 = await PricingService.calculatePrice({
      equipmentId: equipment.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      quantity: 1,
      promoCode: 'WELCOME20',
    });
    console.log('Test 3: 5 days rental with WELCOME20 promo code');
    console.log(`  Base: ${price3.basePrice} TL`);
    console.log(`  Subtotal: ${price3.subtotal} TL`);
    console.log(`  Discounts: ${price3.totalDiscount} TL`);
    console.log(`  Final Price: ${price3.finalPrice} TL`);
    if (price3.discounts.length > 0) {
      price3.discounts.forEach((discount) => {
        console.log(`  - ${discount.name}: -${discount.amount} TL`);
      });
    }
    console.log();

    // 5. Test bundle creation
    console.log('📦 Creating equipment bundle...');
    const secondEquipment = await prisma.equipment.findFirst({
      where: {
        id: { not: equipment.id },
        status: 'AVAILABLE',
      },
    });

    if (secondEquipment) {
      const bundle = await PricingService.createBundle(
        {
          name: 'Başlangıç Paketi',
          description: 'Yeni başlayanlar için ideal ekipman seti',
          category: equipment.category,
          bundlePrice: equipment.dailyPrice! + secondEquipment.dailyPrice! - 100, // 100 TL discount
          isActive: true,
        },
        [
          { equipmentId: equipment.id, quantity: 1 },
          { equipmentId: secondEquipment.id, quantity: 1 },
        ]
      );
      console.log(`✅ Bundle created: ${bundle.name} (ID: ${bundle.id})`);
      
      const savings = await PricingService.calculateBundleSavings(bundle.id);
      console.log(`   Individual prices: ${savings.originalPrice} TL`);
      console.log(`   Bundle price: ${savings.bundlePrice} TL`);
      console.log(`   You save: ${savings.savings} TL (${savings.savingsPercent}%)\n`);
    }

    // 6. Get statistics
    console.log('📊 Pricing System Statistics:');
    const stats = await prisma.pricingRule.count();
    const discountCount = await prisma.discountCode.count();
    const bundleCount = await prisma.equipmentBundle.count();
    console.log(`  Pricing Rules: ${stats}`);
    console.log(`  Discount Codes: ${discountCount}`);
    console.log(`  Equipment Bundles: ${bundleCount}\n`);

    console.log('✅ All pricing tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPricingSystem();
