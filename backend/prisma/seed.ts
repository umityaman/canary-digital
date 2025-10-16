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

  // Sample sipariş oluştur (eğer yoksa)
  const existingOrder = await prisma.order.findFirst({
    where: { orderNumber: 'ORD-001' }
  });
  
  if (!existingOrder) {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-001',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
        totalAmount: 1350.0,
        status: 'CONFIRMED',
        notes: 'Reklam çekimi için ekipman kiralaması',
        customerId: 1, // İlk müşteri
        companyId: company.id,
        orderItems: {
          create: [
            {
              quantity: 1,
              dailyRate: 450.0,
              totalAmount: 1350.0,
              equipmentId: 1 // Sony A7 IV
            }
          ]
        }
      },
      include: {
        orderItems: true
      }
    });
    console.log('✅ Sample order created');
  } else {
    console.log('⏭️  Order already exists, skipping');
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
