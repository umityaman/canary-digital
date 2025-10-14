import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  // RESERVATION Templates
  {
    code: 'RESERVATION_CONFIRMED',
    name: 'Rezervasyon Onaylandı',
    description: 'Müşteriye rezervasyonu onaylandığında gönderilir',
    category: 'RESERVATION',
    type: 'EMAIL',
    subject: 'Rezervasyonunuz Onaylandı - {{equipmentName}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Rezervasyonunuz başarıyla onaylandı.</p>
      <h3>Rezervasyon Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Başlangıç:</strong> {{startDate}}</li>
        <li><strong>Bitiş:</strong> {{endDate}}</li>
        <li><strong>Toplam Tutar:</strong> {{totalAmount}} TL</li>
      </ul>
      <p>Teslimat günü için hazırlıklarınızı yapabilirsiniz.</p>
      <p>Teşekkürler!</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'startDate', 'endDate', 'totalAmount']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'RESERVATION_PENDING',
    name: 'Rezervasyon Beklemede',
    description: 'Yeni rezervasyon oluşturulduğunda müşteriye gönderilir',
    category: 'RESERVATION',
    type: 'EMAIL',
    subject: 'Rezervasyon Talebiniz Alındı - {{equipmentName}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Rezervasyon talebiniz alınmıştır ve inceleme sürecindedir.</p>
      <h3>Rezervasyon Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Başlangıç:</strong> {{startDate}}</li>
        <li><strong>Bitiş:</strong> {{endDate}}</li>
      </ul>
      <p>En kısa sürede size geri dönüş yapacağız.</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'startDate', 'endDate']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'RESERVATION_CANCELLED',
    name: 'Rezervasyon İptal Edildi',
    description: 'Rezervasyon iptal edildiğinde gönderilir',
    category: 'RESERVATION',
    type: 'EMAIL',
    subject: 'Rezervasyonunuz İptal Edildi - {{equipmentName}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>{{equipmentName}} için rezervasyonunuz iptal edilmiştir.</p>
      <p><strong>İptal Nedeni:</strong> {{reason}}</p>
      <p>Başka bir rezervasyon yapmak isterseniz, bizimle iletişime geçebilirsiniz.</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'reason']),
    isActive: true,
    isDefault: true,
  },

  // ORDER Templates
  {
    code: 'ORDER_CREATED',
    name: 'Sipariş Oluşturuldu',
    description: 'Yeni sipariş oluşturulduğunda gönderilir',
    category: 'ORDER',
    type: 'EMAIL',
    subject: 'Siparişiniz Oluşturuldu - #{{orderNumber}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Siparişiniz başarıyla oluşturuldu.</p>
      <h3>Sipariş Bilgileri:</h3>
      <ul>
        <li><strong>Sipariş No:</strong> #{{orderNumber}}</li>
        <li><strong>Tarih:</strong> {{orderDate}}</li>
        <li><strong>Toplam:</strong> {{totalAmount}} TL</li>
        <li><strong>Durum:</strong> {{status}}</li>
      </ul>
      <p>Sipariş detaylarınızı hesabınızdan takip edebilirsiniz.</p>
    `,
    variables: JSON.stringify(['customerName', 'orderNumber', 'orderDate', 'totalAmount', 'status']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'ORDER_READY',
    name: 'Sipariş Hazır',
    description: 'Sipariş teslimata hazır olduğunda gönderilir',
    category: 'ORDER',
    type: 'EMAIL',
    subject: 'Siparişiniz Teslimata Hazır - #{{orderNumber}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Siparişiniz teslimata hazır!</p>
      <h3>Teslimat Bilgileri:</h3>
      <ul>
        <li><strong>Sipariş No:</strong> #{{orderNumber}}</li>
        <li><strong>Teslimat Tarihi:</strong> {{deliveryDate}}</li>
        <li><strong>Teslimat Adresi:</strong> {{deliveryAddress}}</li>
      </ul>
      <p>Lütfen teslimat saatinde hazır olunuz.</p>
    `,
    variables: JSON.stringify(['customerName', 'orderNumber', 'deliveryDate', 'deliveryAddress']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'ORDER_COMPLETED',
    name: 'Sipariş Tamamlandı',
    description: 'Sipariş tamamlandığında gönderilir',
    category: 'ORDER',
    type: 'EMAIL',
    subject: 'Siparişiniz Tamamlandı - #{{orderNumber}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Siparişiniz başarıyla tamamlanmıştır. Bizi tercih ettiğiniz için teşekkür ederiz!</p>
      <h3>Sipariş Özeti:</h3>
      <ul>
        <li><strong>Sipariş No:</strong> #{{orderNumber}}</li>
        <li><strong>Tamamlanma Tarihi:</strong> {{completedDate}}</li>
        <li><strong>Toplam Tutar:</strong> {{totalAmount}} TL</li>
      </ul>
      <p>Deneyiminizi değerlendirmek için lütfen geri bildirimde bulununuz.</p>
    `,
    variables: JSON.stringify(['customerName', 'orderNumber', 'completedDate', 'totalAmount']),
    isActive: true,
    isDefault: true,
  },

  // EQUIPMENT Templates
  {
    code: 'EQUIPMENT_AVAILABLE',
    name: 'Ekipman Müsait',
    description: 'Beklenen ekipman müsait olduğunda gönderilir',
    category: 'EQUIPMENT',
    type: 'EMAIL',
    subject: 'İstediğiniz Ekipman Artık Müsait - {{equipmentName}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Harika haber! Beklediğiniz ekipman artık müsait.</p>
      <h3>Ekipman Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Kategori:</strong> {{category}}</li>
        <li><strong>Günlük Fiyat:</strong> {{dailyRate}} TL</li>
      </ul>
      <p>Hemen rezervasyon yapabilirsiniz!</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'category', 'dailyRate']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'EQUIPMENT_MAINTENANCE',
    name: 'Ekipman Bakımda',
    description: 'Ekipman bakıma alındığında gönderilir',
    category: 'EQUIPMENT',
    type: 'EMAIL',
    subject: 'Ekipman Bakım Bildirimi - {{equipmentName}}',
    body: `
      <p>Sayın yönetici,</p>
      <p>{{equipmentName}} bakıma alınmıştır.</p>
      <h3>Bakım Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Bakım Tarihi:</strong> {{maintenanceDate}}</li>
        <li><strong>Tahmini Süre:</strong> {{estimatedDuration}}</li>
        <li><strong>Bakım Nedeni:</strong> {{reason}}</li>
      </ul>
    `,
    variables: JSON.stringify(['equipmentName', 'maintenanceDate', 'estimatedDuration', 'reason']),
    isActive: true,
    isDefault: true,
  },

  // REMINDER Templates
  {
    code: 'REMINDER_DUE_TODAY',
    name: 'Bugün İade Hatırlatıcısı',
    description: 'İade tarihi bugün olan ekipmanlar için',
    category: 'REMINDER',
    type: 'EMAIL',
    subject: 'Ekipman İade Hatırlatıcısı - Bugün',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Bu hatırlatma, bugün iade etmeniz gereken ekipman için gönderilmiştir.</p>
      <h3>İade Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>İade Tarihi:</strong> {{dueDate}}</li>
        <li><strong>İade Saati:</strong> {{dueTime}}</li>
        <li><strong>İade Adresi:</strong> {{returnAddress}}</li>
      </ul>
      <p>Lütfen ekipmanı zamanında iade ediniz. Gecikmeler ek ücrete tabi olabilir.</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'dueDate', 'dueTime', 'returnAddress']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'REMINDER_DUE_TOMORROW',
    name: 'Yarın İade Hatırlatıcısı',
    description: 'İade tarihi yarın olan ekipmanlar için',
    category: 'REMINDER',
    type: 'EMAIL',
    subject: 'Ekipman İade Hatırlatıcısı - Yarın',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p>Yarın iade etmeniz gereken ekipman için hatırlatma.</p>
      <h3>İade Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>İade Tarihi:</strong> {{dueDate}}</li>
        <li><strong>İade Saati:</strong> {{dueTime}}</li>
      </ul>
      <p>Lütfen iadenizi planlayınız.</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'dueDate', 'dueTime']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'REMINDER_OVERDUE',
    name: 'Gecikmiş İade',
    description: 'İade tarihi geçen ekipmanlar için',
    category: 'REMINDER',
    type: 'EMAIL',
    subject: 'ACİL: Gecikmiş İade - {{equipmentName}}',
    body: `
      <p>Merhaba {{customerName}},</p>
      <p><strong>ÖNEMLİ:</strong> Aşağıdaki ekipmanın iade tarihi geçmiştir.</p>
      <h3>Geciken Ekipman:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>İade Tarihi:</strong> {{dueDate}} ({{daysLate}} gün gecikme)</li>
        <li><strong>Gecikme Ücreti:</strong> {{lateFee}} TL/gün</li>
      </ul>
      <p>Lütfen ekipmanı en kısa sürede iade ediniz. Ek ücretler uygulanabilir.</p>
    `,
    variables: JSON.stringify(['customerName', 'equipmentName', 'dueDate', 'daysLate', 'lateFee']),
    isActive: true,
    isDefault: true,
  },

  // ALERT Templates
  {
    code: 'ALERT_LOW_STOCK',
    name: 'Düşük Stok Uyarısı',
    description: 'Ekipman stoku düşük olduğunda',
    category: 'ALERT',
    type: 'EMAIL',
    subject: 'Stok Uyarısı - {{equipmentName}}',
    body: `
      <p>Sayın yönetici,</p>
      <p>{{equipmentName}} stoku kritik seviyede!</p>
      <h3>Stok Durumu:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Mevcut:</strong> {{currentStock}} adet</li>
        <li><strong>Minimum:</strong> {{minStock}} adet</li>
        <li><strong>Rezerve:</strong> {{reserved}} adet</li>
      </ul>
      <p>Lütfen yeni ekipman satın alınız.</p>
    `,
    variables: JSON.stringify(['equipmentName', 'currentStock', 'minStock', 'reserved']),
    isActive: true,
    isDefault: true,
  },
  {
    code: 'ALERT_DAMAGE_REPORTED',
    name: 'Hasar Bildirimi',
    description: 'Ekipmanda hasar bildirildiğinde',
    category: 'ALERT',
    type: 'EMAIL',
    subject: 'Hasar Bildirimi - {{equipmentName}}',
    body: `
      <p>Sayın yönetici,</p>
      <p>{{equipmentName}} için hasar bildirimi yapılmıştır.</p>
      <h3>Hasar Detayları:</h3>
      <ul>
        <li><strong>Ekipman:</strong> {{equipmentName}}</li>
        <li><strong>Bildirim Tarihi:</strong> {{reportDate}}</li>
        <li><strong>Bildiren:</strong> {{reportedBy}}</li>
        <li><strong>Açıklama:</strong> {{description}}</li>
      </ul>
      <p>Lütfen ekipmanı inceleyin ve gerekli aksiyonu alın.</p>
    `,
    variables: JSON.stringify(['equipmentName', 'reportDate', 'reportedBy', 'description']),
    isActive: true,
    isDefault: true,
  },
];

async function seedNotificationTemplates() {
  console.log('🌱 Seeding notification templates...\n');

  try {
    let created = 0;
    let skipped = 0;

    for (const template of defaultTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.notificationTemplate.findUnique({
          where: { code: template.code },
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${template.name} (already exists)`);
          skipped++;
        } else {
          await prisma.notificationTemplate.create({
            data: template,
          });
          console.log(`✅ Created: ${template.name}`);
          created++;
        }
      } catch (error: any) {
        console.error(`❌ Failed to create ${template.name}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${defaultTemplates.length}`);
    console.log('\n✅ Notification templates seeded successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding notification templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedNotificationTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedNotificationTemplates;
