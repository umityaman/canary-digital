import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvoices() {
  console.log('🌱 Fatura ve İrsaliye seed başlıyor...');

  try {
    // 1. Company ve User kontrol
    let company = await prisma.company.findFirst();
    if (!company) {
      throw new Error('❌ Company bulunamadı! Önce ana seed.ts çalıştırın.');
    }
    console.log('✅ Company bulundu:', company.name);

    let user = await prisma.user.findFirst({
      where: { email: 'admin@canary.com' }
    });
    
    if (!user) {
      throw new Error('❌ Admin user bulunamadı! Önce ana seed.ts çalıştırın.');
    }
    console.log('✅ User bulundu:', user.name);

    // 2. Müşteriler oluştur
    const customers = [
      {
        name: 'ABC Teknoloji A.Ş.',
        email: 'info@abcteknoloji.com',
        phone: '+90 212 555 0001',
        address: 'Levent Mahallesi, Büyükdere Cad. No: 45, Şişli/İstanbul',
        company: 'ABC Teknoloji A.Ş.',
        taxNumber: '9876543210'
      },
      {
        name: 'XYZ Medya Ltd. Şti.',
        email: 'contact@xyzmedia.com',
        phone: '+90 216 555 0002',
        address: 'Bostancı Mahallesi, Bağdat Cad. No: 234, Kadıköy/İstanbul',
        company: 'XYZ Medya Ltd. Şti.',
        taxNumber: '5432167890'
      },
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@gmail.com',
        phone: '+90 532 555 0003',
        address: 'Çankaya Mahallesi, Atatürk Bulvarı No: 567, Çankaya/Ankara',
        company: null,
        taxNumber: '12345678901'
      },
      {
        name: 'DEF E-Ticaret A.Ş.',
        email: 'info@defshop.com',
        phone: '+90 232 555 0004',
        address: 'Alsancak Mahallesi, Kıbrıs Şehitleri Cad. No: 89, Konak/İzmir',
        company: 'DEF E-Ticaret A.Ş.',
        taxNumber: '1122334455'
      },
      {
        name: 'Zeynep Kaya',
        email: 'zeynep.kaya@hotmail.com',
        phone: '+90 533 555 0005',
        address: 'Konyaaltı Sahili, Atatürk Bulvarı No: 123, Konyaaltı/Antalya',
        company: null,
        taxNumber: '98765432109'
      }
    ];

    console.log('\n👥 Müşteriler oluşturuluyor...');
    const createdCustomers = [];
    for (const customerData of customers) {
      const existing = await prisma.customer.findFirst({
        where: { email: customerData.email }
      });

      if (!existing) {
        const customer = await prisma.customer.create({
          data: customerData
        });
        createdCustomers.push(customer);
        console.log(`  ✅ ${customer.name}`);
      } else {
        createdCustomers.push(existing);
        console.log(`  ⏭️  ${existing.name} (zaten var)`);
      }
    }

    // 3. Siparişler ve Faturalar oluştur
    console.log('\n📦 Siparişler ve Faturalar oluşturuluyor...');

    const ordersData = [
      {
        customer: createdCustomers[0],
        orderNumber: 'ORD-2025-0001',
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-11-15'),
        totalAmount: 50000,
        status: 'CONFIRMED',
        notes: 'Web sitesi ve SEO paketi'
      },
      {
        customer: createdCustomers[1],
        orderNumber: 'ORD-2025-0002',
        startDate: new Date('2025-10-18'),
        endDate: new Date('2026-01-18'),
        totalAmount: 35000,
        status: 'CONFIRMED',
        notes: 'Sosyal medya yönetimi 3 aylık'
      },
      {
        customer: createdCustomers[2],
        orderNumber: 'ORD-2025-0003',
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-10-27'),
        totalAmount: 8200,
        status: 'COMPLETED',
        notes: 'Kişisel web sitesi'
      },
      {
        customer: createdCustomers[3],
        orderNumber: 'ORD-2025-0004',
        startDate: new Date('2025-10-22'),
        endDate: new Date('2025-12-31'),
        totalAmount: 100000,
        status: 'IN_PROGRESS',
        notes: 'E-ticaret platformu ve mobil uygulama'
      },
      {
        customer: createdCustomers[4],
        orderNumber: 'ORD-2025-0005',
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-11-05'),
        totalAmount: 10000,
        status: 'COMPLETED',
        notes: 'Düğün fotoğraf ve video çekimi'
      }
    ];

    for (const orderData of ordersData) {
      const existingOrder = await prisma.order.findFirst({
        where: { orderNumber: orderData.orderNumber }
      });

      if (existingOrder) {
        console.log(`  ⏭️  ${orderData.orderNumber} (zaten var)`);
        continue;
      }

      // Order oluştur
      const order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          customerId: orderData.customer.id,
          companyId: company.id,
          startDate: orderData.startDate,
          endDate: orderData.endDate,
          totalAmount: orderData.totalAmount,
          status: orderData.status,
          notes: orderData.notes
        }
      });

      // Fatura oluştur
      const invoiceNumber = `FAT-${order.orderNumber.split('-')[1]}-${order.orderNumber.split('-')[2]}`;
      const vatAmount = orderData.totalAmount * 0.20; // %20 KDV
      const grandTotal = orderData.totalAmount + vatAmount;

      const invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          customerId: user.id, // Invoice.customer -> User ilişkisi
          invoiceNumber: invoiceNumber,
          invoiceDate: orderData.startDate,
          dueDate: new Date(orderData.startDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
          totalAmount: orderData.totalAmount,
          vatAmount: vatAmount,
          grandTotal: grandTotal,
          paidAmount: orderData.status === 'COMPLETED' ? grandTotal : 0,
          status: orderData.status === 'COMPLETED' ? 'paid' : 'draft',
          type: 'rental'
        }
      });

      console.log(`  ✅ ${order.orderNumber} → ${invoice.invoiceNumber}`);
      console.log(`     Müşteri: ${orderData.customer.name}`);
      console.log(`     Toplam: ${grandTotal.toLocaleString('tr-TR')} ₺ (KDV Dahil)`);
      console.log(`     Durum: ${invoice.status}`);
    }

    // 4. İstatistikler
    console.log('\n📊 Özet:');
    const totalInvoices = await prisma.invoice.count();
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.customer.count();
    const totalAmount = await prisma.invoice.aggregate({
      _sum: { grandTotal: true }
    });

    console.log(`  📄 Toplam Fatura: ${totalInvoices}`);
    console.log(`  📦 Toplam Sipariş: ${totalOrders}`);
    console.log(`   Toplam Müşteri: ${totalCustomers}`);
    console.log(`  💰 Toplam Tutar: ${totalAmount._sum.grandTotal?.toLocaleString('tr-TR')} ₺`);

    console.log('\n✅ Seed tamamlandı!');
    console.log('\n🎯 Test için:');
    console.log('  📄 Faturalar: http://localhost:5173/accounting');
    console.log('  � Login: admin@canary.com / admin123');
    console.log('\n📝 NOT: İrsaliye ve Cari Hesap seed\'leri database migration sonrası eklenecek.');

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
