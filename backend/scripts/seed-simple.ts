import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedSimpleInvoices() {
  try {
    console.log('🌱 Basit fatura seed başlıyor...');

    // Company'yi bul veya oluştur
    let company = await prisma.company.findFirst();
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Canary Dijital Ltd.',
          slug: 'canary',
          email: 'info@canary.com',
          phone: '+90 212 555 0123',
          address: 'İstanbul',
          settings: {},
        } as any,
      });
      console.log('✅ Company oluşturuldu');
    } else {
      console.log('ℹ️  Mevcut company:', company.name);
    }

    // Admin user'ı bul veya oluştur
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          email: 'admin@canary.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN',
          companyId: company.id,
        },
      });
      console.log('✅ Admin oluşturuldu');
    } else {
      console.log('ℹ️  Mevcut admin:', admin.email);
    }

    // 5 Müşteri (User olarak)
    const customers = [
      {
        email: 'abc@teknoloji.com',
        name: 'ABC Teknoloji A.Ş.',
        taxNumber: '9876543210', // VKN (10 hane) - E-Fatura
        taxOffice: 'Kadıköy VD',
        phone: '+90 216 555 0001',
        address: 'Kadıköy, İstanbul',
      },
      {
        email: 'xyz@medya.com',
        name: 'XYZ Medya Ltd.',
        taxNumber: '5432167890', // VKN - E-Fatura
        taxOffice: 'Beşiktaş VD',
        phone: '+90 212 555 0002',
        address: 'Beşiktaş, İstanbul',
      },
      {
        email: 'ahmet@gmail.com',
        name: 'Ahmet Yılmaz',
        taxNumber: '12345678901', // TCKN (11 hane) - E-Arşiv
        phone: '+90 532 555 0003',
        address: 'Şişli, İstanbul',
      },
      {
        email: 'def@eticaret.com',
        name: 'DEF E-Ticaret A.Ş.',
        taxNumber: '1122334455', // VKN - E-Fatura
        taxOffice: 'Ümraniye VD',
        phone: '+90 216 555 0004',
        address: 'Ümraniye, İstanbul',
      },
      {
        email: 'zeynep@gmail.com',
        name: 'Zeynep Kaya',
        taxNumber: '98765432109', // TCKN - E-Arşiv
        phone: '+90 533 555 0005',
        address: 'Beyoğlu, İstanbul',
      },
    ];

    console.log('👥 Müşteriler oluşturuluyor...');
    const createdCustomers: any[] = [];
    
    for (const custData of customers) {
      let customer = await prisma.user.findFirst({
        where: { email: custData.email }
      });

      if (!customer) {
        const hashedPassword = await bcrypt.hash('customer123', 10);
        customer = await prisma.user.create({
          data: {
            email: custData.email,
            password: hashedPassword,
            name: custData.name,
            fullName: custData.name,
            role: 'USER',
            companyId: company.id,
            taxNumber: custData.taxNumber,
            taxOffice: custData.taxOffice,
            phone: custData.phone,
            address: custData.address,
          },
        });
        console.log(`  ✅ ${custData.name}`);
      } else {
        console.log(`  ℹ️  ${custData.name} (mevcut)`);
      }

      createdCustomers.push(customer);
    }

    // Şimdi 5 Sipariş + 5 Fatura oluştur
    console.log('📦 Siparişler ve faturalar oluşturuluyor...');

    const orderData = [
      {
        customer: createdCustomers[0], // ABC Teknoloji
        orderNumber: `ORD-${Date.now()}-001`,
        items: [
          { desc: 'Web Sitesi Tasarımı', qty: 1, price: 25000 },
          { desc: 'SEO Optimizasyonu 6 Aylık', qty: 1, price: 12000 },
          { desc: 'Hosting Yıllık', qty: 1, price: 3000 },
        ],
      },
      {
        customer: createdCustomers[1], // XYZ Medya
        orderNumber: `ORD-${Date.now()}-002`,
        items: [
          { desc: 'Sosyal Medya Yönetimi 3 Ay', qty: 1, price: 15000 },
          { desc: 'İçerik Üretimi 20 Gönderi', qty: 1, price: 10000 },
          { desc: 'Video Prodüksiyon 2 Adet', qty: 2, price: 8000 },
        ],
      },
      {
        customer: createdCustomers[2], // Ahmet Yılmaz (TCKN)
        orderNumber: `ORD-${Date.now()}-003`,
        items: [
          { desc: 'Kişisel Web Sitesi', qty: 1, price: 5000 },
          { desc: 'Logo Tasarımı', qty: 1, price: 2000 },
          { desc: 'Domain ve Hosting', qty: 1, price: 1200 },
        ],
      },
      {
        customer: createdCustomers[3], // DEF E-Ticaret
        orderNumber: `ORD-${Date.now()}-004`,
        items: [
          { desc: 'E-Ticaret Platformu Kurulumu', qty: 1, price: 45000 },
          { desc: 'Ödeme Sistemi Entegrasyonu', qty: 1, price: 8000 },
          { desc: 'Mobil Uygulama iOS+Android', qty: 1, price: 35000 },
          { desc: 'Admin Paneli', qty: 1, price: 12000 },
        ],
      },
      {
        customer: createdCustomers[4], // Zeynep Kaya (TCKN)
        orderNumber: `ORD-${Date.now()}-005`,
        items: [
          { desc: 'Fotoğraf Çekimi', qty: 1, price: 3500 },
          { desc: 'Video Kurgu', qty: 1, price: 2500 },
          { desc: 'Drone Çekimi', qty: 1, price: 4000 },
        ],
      },
    ];

    let invoiceCount = 0;
    let totalAmount = 0;

    for (let i = 0; i < orderData.length; i++) {
      const data = orderData[i];
      const customer = data.customer;

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerId: customer.id,
          companyId: company.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalAmount: data.items.reduce((sum, item) => sum + (item.qty * item.price), 0),
          status: 'CONFIRMED',
          notes: `Otomatik seed: ${customer.name}`,
        },
      });

      // Fatura hesapları
      const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
      const vatAmount = subtotal * 0.20; // %20 KDV
      const grandTotal = subtotal + vatAmount;

      // Fatura numarası
      const invoiceNumber = `FAT-2025-${String(i + 1).padStart(4, '0')}`;

      // Fatura oluştur
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          customerId: customer.id,
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalAmount: subtotal,
          vatAmount: vatAmount,
          grandTotal: grandTotal,
          paidAmount: 0,
          status: 'draft',
          type: 'sales',
        },
      });

      invoiceCount++;
      totalAmount += grandTotal;

      console.log(`  ✅ ${invoiceNumber}: ${customer.name} - ${grandTotal.toFixed(2)} TL`);
    }

    console.log('\n✨ Seed tamamlandı!');
    console.log(`📊 Toplam: ${invoiceCount} fatura, ${totalAmount.toFixed(2)} TL`);
    console.log(`👥 ${createdCustomers.length} müşteri oluşturuldu`);
    console.log(`   - ${createdCustomers.filter((c: any) => c.taxNumber?.length === 10).length} VKN (E-Fatura)`);
    console.log(`   - ${createdCustomers.filter((c: any) => c.taxNumber?.length === 11).length} TCKN (E-Arşiv)`);

  } catch (error) {
    console.error('❌ Seed hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSimpleInvoices();
