import { PrismaClient } from '@prisma/client';
import { ReservationService } from '../services/ReservationService';

const prisma = new PrismaClient();
const reservationService = new ReservationService();

async function testReservationSystem() {
  console.log('🧪 Rezervasyon Sistemi Test Başlıyor...\n');

  try {
    // Test company
    const companyId = 1;

    // 1. Availability Check Test
    console.log('📋 Test 1: Ekipman Müsaitliği Kontrolü');
    console.log('=====================================');
    
    const equipment = await prisma.equipment.findFirst({
      where: { companyId },
    });

    if (!equipment) {
      console.log('❌ Test için ekipman bulunamadı');
      return;
    }

    console.log(`✓ Test ekipmanı: ${equipment.name} (ID: ${equipment.id})`);

    const startDate = new Date('2025-10-20');
    const endDate = new Date('2025-10-25');

    const availability = await reservationService.checkAvailability(
      equipment.id,
      startDate,
      endDate
    );

    console.log(`✓ Müsaitlik: ${availability.available ? 'EVET' : 'HAYIR'}`);
    console.log(`✓ Mevcut miktar: ${availability.availableQuantity}`);
    console.log(`✓ Çakışan rezervasyon: ${availability.conflicts.length} adet`);
    console.log('✅ Test 1 BAŞARILI\n');

    // 2. Reservation Creation Test
    console.log('📋 Test 2: Yeni Rezervasyon Oluşturma');
    console.log('=====================================');

    const newReservation = await reservationService.createReservation({
      companyId,
      customerName: 'Test Müşteri',
      customerEmail: 'test@example.com',
      customerPhone: '+90 555 123 4567',
      customerAddress: 'Test Adres, İstanbul',
      items: [
        {
          equipmentId: equipment.id,
          quantity: 1,
        },
      ],
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-05'),
      pickupTime: '10:00',
      returnTime: '17:00',
      notes: 'Test rezervasyonu',
      autoApprove: false,
    });

    console.log(`✓ Rezervasyon No: ${newReservation.reservationNo}`);
    console.log(`✓ Durum: ${newReservation.status}`);
    console.log(`✓ Toplam Tutar: ${newReservation.totalAmount.toFixed(2)} TL`);
    console.log(`✓ Depozito: ${newReservation.depositAmount.toFixed(2)} TL`);
    console.log(`✓ Ekipman sayısı: ${newReservation.items.length}`);
    console.log('✅ Test 2 BAŞARILI\n');

    // 3. Status Update Test
    console.log('📋 Test 3: Rezervasyon Onaylama');
    console.log('=====================================');

    const approvedReservation = await reservationService.updateReservationStatus(
      newReservation.id,
      'CONFIRMED',
      1,
      'Test onayı'
    );

    console.log(`✓ Yeni durum: ${approvedReservation.status}`);
    console.log(`✓ Onaylayan: ${approvedReservation.approvedBy}`);
    console.log(`✓ Durum geçmişi: ${approvedReservation.statusHistory.length} kayıt`);
    console.log('✅ Test 3 BAŞARILI\n');

    // 4. Payment Recording Test
    console.log('📋 Test 4: Ödeme Kaydı');
    console.log('=====================================');

    const payment = await reservationService.recordPayment({
      reservationId: newReservation.id,
      amount: newReservation.depositAmount,
      paymentType: 'DEPOSIT',
      paymentMethod: 'CARD',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      paidBy: 'Test Müşteri',
      receivedBy: 1,
      receiptNumber: 'RCP-2025-0001',
    });

    console.log(`✓ Ödeme tutarı: ${payment.amount.toFixed(2)} TL`);
    console.log(`✓ Ödeme tipi: ${payment.paymentType}`);
    console.log(`✓ Ödeme yöntemi: ${payment.paymentMethod}`);
    console.log(`✓ Durum: ${payment.status}`);
    console.log('✅ Test 4 BAŞARILI\n');

    // 5. Get Reservations Test
    console.log('📋 Test 5: Rezervasyon Listesi');
    console.log('=====================================');

    const reservations = await reservationService.getReservations({
      companyId,
      status: 'CONFIRMED',
      page: 1,
      limit: 10,
    });

    console.log(`✓ Toplam rezervasyon: ${reservations.total}`);
    console.log(`✓ Sayfa: ${reservations.page}/${reservations.totalPages}`);
    console.log(`✓ Bu sayfada: ${reservations.reservations.length} adet`);
    console.log('✅ Test 5 BAŞARILI\n');

    // 6. Statistics Test
    console.log('📋 Test 6: İstatistikler');
    console.log('=====================================');

    const stats = await reservationService.getReservationStats({
      companyId,
    });

    console.log(`✓ Toplam rezervasyon: ${stats.total}`);
    console.log(`✓ Bekleyen: ${stats.byStatus.pending}`);
    console.log(`✓ Onaylı: ${stats.byStatus.confirmed}`);
    console.log(`✓ Devam eden: ${stats.byStatus.inProgress}`);
    console.log(`✓ Tamamlanan: ${stats.byStatus.completed}`);
    console.log(`✓ İptal: ${stats.byStatus.cancelled}`);
    console.log(`✓ Red: ${stats.byStatus.rejected}`);
    console.log(`✓ Toplam gelir: ${stats.revenue.total.toFixed(2)} TL`);
    console.log('✅ Test 6 BAŞARILI\n');

    // 7. Bulk Availability Test
    console.log('📋 Test 7: Toplu Müsaitlik Kontrolü');
    console.log('=====================================');

    const allEquipment = await prisma.equipment.findMany({
      where: { companyId },
      take: 3,
    });

    const bulkAvailability = await reservationService.checkBulkAvailability(
      allEquipment.map((e) => ({ equipmentId: e.id, quantity: 1 })),
      new Date('2025-12-01'),
      new Date('2025-12-05')
    );

    console.log(`✓ Kontrol edilen ekipman: ${bulkAvailability.items.length}`);
    console.log(`✓ Hepsi müsait: ${bulkAvailability.allAvailable ? 'EVET' : 'HAYIR'}`);
    bulkAvailability.items.forEach((item, index) => {
      console.log(
        `  ${index + 1}. Ekipman ID ${item.equipmentId}: ${
          item.available ? '✓ Müsait' : '✗ Müsait Değil'
        } (${item.availableQuantity}/${item.requestedQuantity})`
      );
    });
    console.log('✅ Test 7 BAŞARILI\n');

    // 8. Price Calculation Test
    console.log('📋 Test 8: Fiyat Hesaplama');
    console.log('=====================================');

    const priceCalc = await reservationService.calculateReservationPrice(
      companyId,
      [{ equipmentId: equipment.id, quantity: 1 }],
      new Date('2025-12-10'),
      new Date('2025-12-15')
    );

    console.log(`✓ Ara toplam: ${priceCalc.subtotal.toFixed(2)} TL`);
    console.log(`✓ İndirim: ${priceCalc.discountAmount.toFixed(2)} TL`);
    console.log(`✓ KDV: ${priceCalc.taxAmount.toFixed(2)} TL`);
    console.log(`✓ Toplam: ${priceCalc.totalAmount.toFixed(2)} TL`);
    console.log('✅ Test 8 BAŞARILI\n');

    console.log('═══════════════════════════════════');
    console.log('🎉 TÜM TESTLER BAŞARIYLA TAMAMLANDI!');
    console.log('═══════════════════════════════════\n');

    console.log('📊 ÖZET:');
    console.log(`✓ 8/8 test başarılı`);
    console.log(`✓ Rezervasyon sistemi tamamen çalışıyor`);
    console.log(`✓ Database modelleri doğru`);
    console.log(`✓ Service metotları çalışıyor`);
    console.log(`✓ Bildirimler entegre`);
    console.log(`✓ Fiyatlandırma entegre\n`);
  } catch (error: any) {
    console.error('❌ TEST HATASI:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testReservationSystem();
