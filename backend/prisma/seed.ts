import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Şirket oluştur veya bul
  let company = await prisma.company.findFirst({
    where: { email: 'info@canaryrentals.com' }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Canary Camera Rentals',
        email: 'info@canaryrentals.com',
        phone: '+90 212 555 0123',
        address: 'İstanbul, Türkiye'
      }
    });
  }

  console.log('✅ Company created/found');

  // Admin kullanıcı oluştur veya bul
  const hashedPassword = await bcrypt.hash('admin123', 10);
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@canary.com' }
  });
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@canary.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        companyId: company.id
      }
    });
  }

  console.log('✅ Admin user created/found');

  // Test kullanıcı oluştur veya bul
  const testUserPassword = await bcrypt.hash('test123', 10);
  let testUser = await prisma.user.findFirst({
    where: { email: 'test@canary.com' }
  });
  
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@canary.com',
        password: testUserPassword,
        name: 'Test User',
        role: 'USER',
        companyId: company.id
      }
    });
  }

  console.log('✅ Test user created/found');

  // Ekipmanlar oluştur (eğer yoksa)
  const existingEquipment = await prisma.equipment.count({
    where: { companyId: company.id }
  });
  
  if (existingEquipment === 0) {
    const equipment = await prisma.equipment.createMany({
      data: [
        {
          name: 'Sony A7 IV',
          brand: 'Sony',
          model: 'A7 IV',
          category: 'Kamera',
          serialNumber: 'SN001',
          qrCode: 'EQ-001',
          dailyPrice: 450.0,
          weeklyPrice: 2700.0,
          monthlyPrice: 9000.0,
          description: 'Profesyonel aynasız kamera',
          companyId: company.id
        },
      {
        name: 'Canon EOS R6',
        brand: 'Canon',
        model: 'EOS R6',
        category: 'Kamera',
        serialNumber: 'SN002',
        qrCode: 'EQ-002',
        dailyPrice: 400.0,
        weeklyPrice: 2400.0,
        monthlyPrice: 8000.0,
        description: 'Full frame aynasız kamera',
        companyId: company.id
      },
      {
        name: 'Sony FX3',
        brand: 'Sony',
        model: 'FX3',
        category: 'Video Kamera',
        serialNumber: 'SN003',
        qrCode: 'EQ-003',
        dailyPrice: 600.0,
        weeklyPrice: 3600.0,
        monthlyPrice: 12000.0,
        description: 'Sinema kalitesinde video kamera',
        companyId: company.id
      },
      {
        name: 'DJI Ronin-S',
        brand: 'DJI',
        model: 'Ronin-S',
        category: 'Gimbal',
        serialNumber: 'SN004',
        qrCode: 'EQ-004',
        dailyPrice: 200.0,
        weeklyPrice: 1200.0,
        monthlyPrice: 4000.0,
        description: '3-axis kamera gimbal',
        companyId: company.id
      },
      {
        name: 'Manfrotto Tripod',
        brand: 'Manfrotto',
        model: 'MT055CXPRO4',
        category: 'Tripod',
        serialNumber: 'SN005',
        qrCode: 'EQ-005',
        dailyPrice: 75.0,
        weeklyPrice: 450.0,
        monthlyPrice: 1500.0,
        description: 'Karbon fiber tripod',
        companyId: company.id
      }
    ]
    });
    console.log('✅ Equipment created');
  } else {
    console.log('⏭️  Equipment already exists, skipping');
  }

  // Müşteriler oluştur
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Acme Productions',
        email: 'contact@acme.com',
        phone: '+90 212 555 0100',
        address: 'Levent, İstanbul',
        company: 'Acme Productions Ltd.',
        taxNumber: '1234567890'
      },
      {
        name: 'Creative Agency',
        email: 'hello@creative.com',
        phone: '+90 212 555 0200',
        address: 'Kadıköy, İstanbul',
        company: 'Creative Agency Inc.',
        taxNumber: '0987654321'
      }
    ]
  });

  console.log('✅ Customers created');

  // Sample siparişler oluştur (eğer yoksa)
  const existingOrders = await prisma.order.count();
  
  if (existingOrders === 0) {
    // 5 farklı statüde sipariş oluştur
    const orderStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'CONFIRMED'];
    const orderData = [];
    
    for (let i = 0; i < 5; i++) {
      const startDate = new Date(2025, 9, 10 + i); // October 10-14, 2025
      const endDate = new Date(2025, 9, 13 + i); // 3 days rental
      const days = 3;
      const dailyRate = 450.0;
      
      orderData.push({
        orderNumber: `ORD-2025${String(i + 1).padStart(3, '0')}`,
        startDate,
        endDate,
        totalAmount: dailyRate * days,
        status: orderStatuses[i],
        notes: `Ekipman kiralaması - ${i + 1}`,
        customerId: (i % 2) + 1, // Rotate between 2 customers
        companyId: company.id,
        userId: admin.id
      });
    }
    
    for (const data of orderData) {
      await prisma.order.create({
        data: {
          ...data,
          orderItems: {
            create: [
              {
                quantity: 1,
                dailyRate: 450.0,
                totalAmount: data.totalAmount,
                equipmentId: 1 // Sony A7 IV
              }
            ]
          }
        }
      });
    }
    console.log('✅ Sample orders created');
  } else {
    console.log('⏭️  Orders already exist, skipping');
  }

  // Faturalar oluştur
  const existingInvoices = await prisma.invoice.count();
  if (existingInvoices === 0) {
    const orders = await prisma.order.findMany({ take: 5 });
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const subtotal = order.totalAmount;
      const vatRate = 0.20; // %20 KDV
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;
      
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-2025${String(i + 1).padStart(4, '0')}`,
          orderId: order.id,
          customerId: order.customerId,
          companyId: company.id,
          invoiceType: 'rental',
          invoiceDate: new Date(2025, 9, 15 + i),
          dueDate: new Date(2025, 10, 15 + i), // 30 days payment term
          items: [
            {
              description: `Sony A7 IV - 3 Gün Kiralama`,
              quantity: 3,
              unitPrice: 450.0,
              amount: subtotal,
            },
          ],
          subtotal,
          vatRate,
          vatAmount,
          totalAmount: subtotal, // For backward compatibility
          grandTotal: total,
          total, // Alias
          status: i < 2 ? 'paid' : 'pending',
          notes: `Fatura - ${order.orderNumber}`,
        },
      });
    }
    console.log('✅ Invoices created');
  } else {
    console.log('⏭️  Invoices already exist, skipping');
  }

  // Ödemeler oluştur (ilk 2 fatura için)
  const existingPayments = await prisma.payment.count();
  if (existingPayments === 0) {
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'paid' },
      take: 2
    });
    
    for (let i = 0; i < paidInvoices.length; i++) {
      await prisma.payment.create({
        data: {
          invoiceId: paidInvoices[i].id,
          amount: paidInvoices[i].total,
          paymentDate: new Date(2025, 9, 20 + i),
          paymentMethod: i === 0 ? 'bank_transfer' : 'credit_card',
          status: 'completed',
          notes: `Ödeme - ${paidInvoices[i].invoiceNumber}`,
        },
      });
    }
    console.log('✅ Payments created');
  } else {
    console.log('⏭️  Payments already exist, skipping');
  }

  // Teklifler oluştur
  const existingOffers = await prisma.offer.count();
  if (existingOffers === 0) {
    const offerStatuses = ['sent', 'draft', 'accepted', 'rejected', 'expired'];
    
    for (let i = 0; i < 5; i++) {
      const customerId = (i % 2) + 1;
      const days = 5;
      const subtotal = 450.0 * days;
      const vatRate = 0.20;
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;
      
      await prisma.offer.create({
        data: {
          offerNumber: `OF-20251025-${String(i + 1).padStart(3, '0')}`,
          customerId,
          offerDate: new Date(2025, 9, 20 + i),
          validUntil: new Date(2025, 10, 20 + i), // 30 days validity
          items: [
            {
              description: `Sony A7 IV - 5 Gün Kiralama`,
              quantity: 5,
              unitPrice: 450.0,
              amount: subtotal,
            },
          ],
          totalAmount: subtotal,
          vatAmount,
          grandTotal: total,
          status: offerStatuses[i],
          notes: `Teklif - Ekipman kirası ${i + 1}`,
        },
      });
    }
    console.log('✅ Offers created');
  } else {
    console.log('⏭️  Offers already exist, skipping');
  }

  // Giderler oluştur
  const existingExpenses = await prisma.expense.count();
  if (existingExpenses === 0) {
    const expenseCategories = ['Rent', 'Utilities', 'Maintenance', 'Insurance', 'Marketing'];
    const expenseAmounts = [15000, 2500, 3000, 5000, 4000];
    
    for (let i = 0; i < 5; i++) {
      await prisma.expense.create({
        data: {
          description: expenseCategories[i],
          amount: expenseAmounts[i],
          category: expenseCategories[i],
          date: new Date(2025, 9, 5 + i),
          companyId: company.id,
          status: 'paid',
          paymentMethod: 'bank_transfer',
        },
      });
    }
    console.log('✅ Expenses created');
  } else {
    console.log('⏭️  Expenses already exist, skipping');
  }

  // Tedarikçiler oluştur
  await prisma.supplier.createMany({
    data: [
      {
        name: 'Canon Türkiye',
        email: 'info@canon.com.tr',
        phone: '+90 212 123 4567',
        address: 'Maslak, Sarıyer, İstanbul',
        contactPerson: 'Mehmet Yılmaz',
        notes: 'Kamera, lens ve fotoğraf ekipmanları tedarikçisi',
        companyId: company.id
      },
      {
        name: 'Sony Professional',
        email: 'pro@sony.com.tr',
        phone: '+90 216 987 6543',
        address: 'Kadıköy, İstanbul',
        contactPerson: 'Ayşe Demir',
        notes: 'Video kamera ve ses kayıt ekipmanları',
        companyId: company.id
      },
      {
        name: 'DJI Authorized Dealer',
        email: 'sales@dji.com.tr',
        phone: '+90 212 555 0123',
        address: 'Beşiktaş, İstanbul',
        contactPerson: 'Ali Kaya',
        notes: 'Drone, gimbal ve hava çekimi ekipmanları',
        companyId: company.id
      },
      {
        name: 'Manfrotto Türkiye',
        email: 'info@manfrotto.com.tr',
        phone: '+90 212 444 5566',
        address: 'Şişli, İstanbul',
        contactPerson: 'Zeynep Arslan',
        notes: 'Tripod, monopod ve destek ekipmanları',
        companyId: company.id
      },
      {
        name: 'Rode Microphones TR',
        email: 'sales@rode.com.tr',
        phone: '+90 216 333 4455',
        address: 'Ataşehir, İstanbul',
        contactPerson: 'Can Öztürk',
        notes: 'Mikrofon ve ses kayıt çözümleri',
        companyId: company.id
      }
    ]
  });

  console.log('✅ Suppliers created');

  console.log('🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('   - 1 Company');
  console.log('   - 2 Users (Admin + Test)');
  console.log('   - 5 Equipment items');
  console.log('   - 2 Customers');
  console.log('   - 5 Orders (various statuses)');
  console.log('   - 5 Invoices (2 paid, 3 pending)');
  console.log('   - 2 Payments');
  console.log('   - 5 Offers (various statuses)');
  console.log('   - 5 Expenses');
  console.log('   - 5 Suppliers');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@canary.com / admin123');
  console.log('   Test:  test@canary.com / test123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
