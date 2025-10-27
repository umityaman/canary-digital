import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvoices() {
  console.log('🌱 Fatura seed başlıyor...');

  try {
    // 1. Company ve User kontrol
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Canary Dijital Çözümler Ltd. Şti.',
          email: 'info@canarydigital.com',
          phone: '+90 216 555 0001',
          address: 'Bağdat Caddesi No: 123',
          city: 'İstanbul',
          district: 'Kadıköy',
          taxNumber: '1234567890',
          taxOffice: 'Kadıköy',
          website: 'https://canarydigital.com'
        }
      });
      console.log('✅ Company oluşturuldu:', company.name);
    }

    let user = await prisma.user.findFirst({
      where: { companyId: company.id }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@canary.com',
          password: '$2b$10$hash', // Placeholder
          role: 'admin',
          companyId: company.id
        }
      });
      console.log('✅ User oluşturuldu:', user.name);
    }

    // 2. Müşteriler oluştur
    const customers = [
      {
        name: 'ABC Teknoloji A.Ş.',
        email: 'info@abcteknoloji.com',
        phone: '+90 212 555 0001',
        address: 'Levent Mahallesi, Büyükdere Cad. No: 45',
        city: 'İstanbul',
        district: 'Şişli',
        taxId: '9876543210', // VKN
        taxOffice: 'Şişli',
        type: 'corporate'
      },
      {
        name: 'XYZ Medya Ltd. Şti.',
        email: 'contact@xyzmedia.com',
        phone: '+90 216 555 0002',
        address: 'Bostancı Mahallesi, Bağdat Cad. No: 234',
        city: 'İstanbul',
        district: 'Kadıköy',
        taxId: '5432167890', // VKN
        taxOffice: 'Kadıköy',
        type: 'corporate'
      },
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@gmail.com',
        phone: '+90 532 555 0003',
        address: 'Çankaya Mahallesi, Atatürk Bulvarı No: 567',
        city: 'Ankara',
        district: 'Çankaya',
        taxId: '12345678901', // TCKN (11 haneli)
        type: 'individual'
      },
      {
        name: 'DEF E-Ticaret A.Ş.',
        email: 'info@defshop.com',
        phone: '+90 232 555 0004',
        address: 'Alsancak Mahallesi, Kıbrıs Şehitleri Cad. No: 89',
        city: 'İzmir',
        district: 'Konak',
        taxId: '1122334455', // VKN
        taxOffice: 'Konak',
        type: 'corporate'
      },
      {
        name: 'Zeynep Kaya',
        email: 'zeynep.kaya@hotmail.com',
        phone: '+90 533 555 0005',
        address: 'Konyaaltı Sahili, Atatürk Bulvarı No: 123',
        city: 'Antalya',
        district: 'Konyaaltı',
        taxId: '98765432109', // TCKN
        type: 'individual'
      }
    ];

    console.log('👥 Müşteriler oluşturuluyor...');
    const createdCustomers = [];
    for (const customerData of customers) {
      const existing = await prisma.customer.findFirst({
        where: { 
          email: customerData.email,
          companyId: company.id 
        }
      });

      if (!existing) {
        const customer = await prisma.customer.create({
          data: {
            ...customerData,
            companyId: company.id
          }
        });
        createdCustomers.push(customer);
        console.log(`  ✅ ${customer.name} (${customer.type})`);
      } else {
        createdCustomers.push(existing);
        console.log(`  ⏭️  ${existing.name} (zaten var)`);
      }
    }

    // 3. Faturalar oluştur
    console.log('\n📄 Faturalar oluşturuluyor...');

    const invoices = [
      {
        customer: createdCustomers[0], // ABC Teknoloji (VKN - E-Fatura)
        invoiceNumber: 'FAT-2025-0001',
        invoiceDate: new Date('2025-10-15'),
        dueDate: new Date('2025-11-15'),
        items: [
          {
            description: 'Web Sitesi Tasarımı ve Geliştirme',
            quantity: 1,
            unitPrice: 25000,
            taxRate: 20
          },
          {
            description: 'SEO Optimizasyonu (6 Aylık)',
            quantity: 6,
            unitPrice: 2000,
            taxRate: 20
          },
          {
            description: 'Hosting Hizmeti (Yıllık)',
            quantity: 1,
            unitPrice: 3000,
            taxRate: 20
          }
        ],
        notes: 'Proje teslim tarihi: 15 Kasım 2025. Ödeme vadesi 30 gün.'
      },
      {
        customer: createdCustomers[1], // XYZ Medya (VKN - E-Fatura)
        invoiceNumber: 'FAT-2025-0002',
        invoiceDate: new Date('2025-10-18'),
        dueDate: new Date('2025-11-18'),
        items: [
          {
            description: 'Sosyal Medya Yönetimi (Aylık)',
            quantity: 3,
            unitPrice: 5000,
            taxRate: 20
          },
          {
            description: 'İçerik Üretimi - 20 Gönderi',
            quantity: 20,
            unitPrice: 500,
            taxRate: 20
          },
          {
            description: 'Video Prodüksiyon',
            quantity: 2,
            unitPrice: 8000,
            taxRate: 20
          }
        ],
        notes: '3 aylık sosyal medya paketi. Video teslim tarihi: 1 Kasım 2025.'
      },
      {
        customer: createdCustomers[2], // Ahmet Yılmaz (TCKN - E-Arşiv)
        invoiceNumber: 'FAT-2025-0003',
        invoiceDate: new Date('2025-10-20'),
        dueDate: new Date('2025-10-27'),
        items: [
          {
            description: 'Kişisel Web Sitesi',
            quantity: 1,
            unitPrice: 5000,
            taxRate: 20
          },
          {
            description: 'Logo Tasarımı',
            quantity: 1,
            unitPrice: 2000,
            taxRate: 20
          },
          {
            description: 'Domain ve Hosting (Yıllık)',
            quantity: 1,
            unitPrice: 1200,
            taxRate: 20
          }
        ],
        notes: 'Bireysel müşteri. E-Arşiv fatura oluşturulacak.'
      },
      {
        customer: createdCustomers[3], // DEF E-Ticaret (VKN - E-Fatura)
        invoiceNumber: 'FAT-2025-0004',
        invoiceDate: new Date('2025-10-22'),
        dueDate: new Date('2025-11-22'),
        items: [
          {
            description: 'E-Ticaret Platformu Geliştirme',
            quantity: 1,
            unitPrice: 45000,
            taxRate: 20
          },
          {
            description: 'Ödeme Sistemi Entegrasyonu (iyzico)',
            quantity: 1,
            unitPrice: 8000,
            taxRate: 20
          },
          {
            description: 'Mobil Uygulama (iOS + Android)',
            quantity: 1,
            unitPrice: 35000,
            taxRate: 20
          },
          {
            description: 'Admin Paneli',
            quantity: 1,
            unitPrice: 12000,
            taxRate: 20
          }
        ],
        notes: 'E-ticaret projesi. Teslim tarihi: 31 Aralık 2025. Ödeme 3 taksit.'
      },
      {
        customer: createdCustomers[4], // Zeynep Kaya (TCKN - E-Arşiv)
        invoiceNumber: 'FAT-2025-0005',
        invoiceDate: new Date('2025-10-25'),
        dueDate: new Date('2025-11-05'),
        items: [
          {
            description: 'Fotoğraf Çekimi (1 Gün)',
            quantity: 1,
            unitPrice: 3500,
            taxRate: 20
          },
          {
            description: 'Video Kurgu',
            quantity: 1,
            unitPrice: 2500,
            taxRate: 20
          },
          {
            description: 'Drone Çekimi',
            quantity: 1,
            unitPrice: 4000,
            taxRate: 20
          }
        ],
        notes: 'Düğün fotoğraf ve video çekimi. Teslim: 15 Kasım 2025.'
      }
    ];

    for (const invoiceData of invoices) {
      const existing = await prisma.invoice.findFirst({
        where: { 
          invoiceNumber: invoiceData.invoiceNumber,
          customerId: invoiceData.customer.id
        }
      });

      if (existing) {
        console.log(`  ⏭️  ${invoiceData.invoiceNumber} (zaten var)`);
        continue;
      }

      // Hesaplamalar
      const subtotal = invoiceData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const taxTotal = invoiceData.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        return sum + (itemSubtotal * item.taxRate / 100);
      }, 0);

      const total = subtotal + taxTotal;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceData.invoiceNumber,
          customerId: invoiceData.customer.id,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          subtotal,
          taxTotal,
          total,
          status: 'draft',
          notes: invoiceData.notes,
          createdBy: user.id
        }
      });

      console.log(`  ✅ ${invoice.invoiceNumber} - ${invoiceData.customer.name}`);
      console.log(`     Toplam: ${total.toLocaleString('tr-TR')} ₺`);
      console.log(`     Müşteri Tipi: ${invoiceData.customer.type === 'corporate' ? 'Kurumsal (E-Fatura)' : 'Bireysel (E-Arşiv)'}`);
    }

    // 4. İstatistikler
    console.log('\n📊 Özet:');
    const totalInvoices = await prisma.invoice.count();
    const totalCustomers = await prisma.customer.count({ where: { companyId: company.id } });
    const totalAmount = await prisma.invoice.aggregate({
      _sum: { total: true }
    });

    console.log(`  📄 Toplam Fatura: ${totalInvoices}`);
    console.log(`  👥 Toplam Müşteri: ${totalCustomers}`);
    console.log(`  💰 Toplam Tutar: ${totalAmount._sum.total?.toLocaleString('tr-TR')} ₺`);

    console.log('\n✅ Seed tamamlandı!');
    console.log('\n🎯 Test için:');
    console.log('  - E-Fatura: FAT-2025-0001, FAT-2025-0002, FAT-2025-0004 (VKN müşteriler)');
    console.log('  - E-Arşiv: FAT-2025-0003, FAT-2025-0005 (TCKN müşteriler)');
    console.log('\n🌐 Frontend URL: http://localhost:5173/accounting');

  } catch (error) {
    console.error('❌ Seed hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedInvoices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
