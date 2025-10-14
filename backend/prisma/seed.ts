import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Şirket oluştur
  const company = await prisma.company.create({
    data: {
      name: 'Canary Camera Rentals',
      email: 'info@canaryrentals.com',
      phone: '+90 212 555 0123',
      address: 'İstanbul, Türkiye'
    }
  });

  console.log('✅ Company created');

  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@canary.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      companyId: company.id
    }
  });

  console.log('✅ Admin user created');

  // Test kullanıcı oluştur
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'test@canary.com',
      password: testUserPassword,
      name: 'Test User',
      role: 'USER',
      companyId: company.id
    }
  });

  console.log('✅ Test user created');

  // Ekipmanlar oluştur
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

  // Sample sipariş oluştur
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

  // Kategoriler oluştur
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Kamera',
        description: 'Fotoğraf ve video kameraları',
        icon: 'Camera',
        color: '#3b82f6',
        companyId: company.id
      },
      {
        name: 'Lens',
        description: 'Kamera lensleri ve optikler',
        icon: 'Circle',
        color: '#8b5cf6',
        companyId: company.id
      },
      {
        name: 'Aydınlatma',
        description: 'LED ışıklar, softbox, reflektör',
        icon: 'Lightbulb',
        color: '#f59e0b',
        companyId: company.id
      },
      {
        name: 'Ses',
        description: 'Mikrofonlar ve ses ekipmanları',
        icon: 'Mic',
        color: '#10b981',
        companyId: company.id
      },
      {
        name: 'Aksesuar',
        description: 'Kamera aksesuarları',
        icon: 'Package',
        color: '#6366f1',
        companyId: company.id
      },
      {
        name: 'Tripod',
        description: 'Tripodlar ve montaj ekipmanları',
        icon: 'Grid2X2',
        color: '#ec4899',
        companyId: company.id
      },
      {
        name: 'Gimbal',
        description: 'Gimbal ve stabilizatörler',
        icon: 'Move',
        color: '#14b8a6',
        companyId: company.id
      },
      {
        name: 'Drone',
        description: 'Drone ve havadan çekim ekipmanları',
        icon: 'Plane',
        color: '#0ea5e9',
        companyId: company.id
      },
      {
        name: 'Diğer',
        description: 'Diğer ekipmanlar',
        icon: 'MoreHorizontal',
        color: '#64748b',
        companyId: company.id
      }
    ]
  });

  console.log('✅ Categories created');

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
