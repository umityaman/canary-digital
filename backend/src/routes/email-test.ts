import express, { Request, Response } from 'express';
import {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPickupReminder,
  sendReturnReminder,
  sendInvoice,
  sendPaymentConfirmation,
  sendLatePaymentWarning,
  sendPasswordReset,
  sendInspectionReport,
  sendMonthlySummary,
  sendPromotionalEmail
} from '../utils/emailService';

const router = express.Router();

/**
 * Test Email Templates
 * POST /api/test-email/:templateName
 */
router.post('/:templateName', async (req: Request, res: Response) => {
  try {
    const { templateName } = req.params;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Email adresi (to) gerekli' });
    }

    let result;

    switch (templateName) {
      case 'welcome':
        result = await sendWelcomeEmail(to, {
          name: 'Test Kullanıcı',
          email: to,
          companyName: 'CANARY ERP Test',
          loginUrl: 'https://canary-production-5a09.up.railway.app/login',
          supportUrl: 'https://canary-production-5a09.up.railway.app/support',
          websiteUrl: 'https://canary-production-5a09.up.railway.app'
        });
        break;

      case 'order-confirmation':
        result = await sendOrderConfirmation(to, {
          customerName: 'Ahmet Yılmaz',
          orderNumber: 'TEST-ORD-001',
          startDate: '20 Ocak 2025',
          endDate: '25 Ocak 2025',
          duration: 5,
          equipment: [
            { name: 'Sony A7III Kamera', quantity: 1, price: '500 TL' },
            { name: 'Canon 24-70mm Lens', quantity: 1, price: '300 TL' },
            { name: 'Manfrotto Tripod', quantity: 2, price: '200 TL' }
          ],
          totalAmount: '1.000 TL',
          depositAmount: '200 TL',
          deliveryMethod: 'Kurye ile Teslimat',
          deliveryAddress: 'Kadıköy, İstanbul',
          notes: 'Ekipmanlar temiz ve çalışır durumda teslim edilecektir.',
          orderUrl: 'https://canary-production-5a09.up.railway.app/orders/001'
        });
        break;

      case 'pickup-reminder':
        result = await sendPickupReminder(to, {
          customerName: 'Mehmet Demir',
          orderNumber: 'TEST-ORD-002',
          pickupDate: '15 Ocak 2025',
          pickupTime: '14:00',
          equipment: [
            { name: 'DJI Mavic 3 Drone', quantity: 1 },
            { name: 'Extra Batarya', quantity: 2 }
          ],
          pickupAddress: 'CANARY Ofis - Beşiktaş, İstanbul',
          contactPhone: '+90 555 123 4567',
          orderUrl: 'https://canary-production-5a09.up.railway.app/orders/002'
        });
        break;

      case 'return-reminder':
        result = await sendReturnReminder(to, {
          customerName: 'Ayşe Kaya',
          orderNumber: 'TEST-ORD-003',
          returnDate: '25 Ocak 2025',
          returnTime: '17:00',
          equipment: [
            { name: 'Sony FX3 Video Kamera', quantity: 1 },
            { name: 'Rode Wireless GO II', quantity: 1 }
          ],
          returnAddress: 'CANARY Ofis - Beşiktaş, İstanbul',
          contactPhone: '+90 555 123 4567',
          lateFee: '100 TL/gün',
          orderUrl: 'https://canary-production-5a09.up.railway.app/orders/003'
        });
        break;

      case 'invoice':
        result = await sendInvoice(to, {
          customerName: 'Zeynep Arslan',
          invoiceNumber: 'INV-2025-001',
          invoiceDate: '10 Ocak 2025',
          orderNumber: 'ORD-2025-001',
          companyName: 'CANARY Kamera Kiralama',
          companyAddress: 'Beşiktaş, İstanbul',
          companyTaxOffice: 'Beşiktaş Vergi Dairesi',
          companyTaxNumber: '1234567890',
          items: [
            { description: 'Sony A7III Kamera (5 gün)', quantity: 1, unitPrice: '500 TL', total: '500 TL' },
            { description: 'Canon 24-70mm Lens (5 gün)', quantity: 1, unitPrice: '300 TL', total: '300 TL' },
            { description: 'Manfrotto Tripod (5 gün)', quantity: 2, unitPrice: '100 TL', total: '200 TL' }
          ],
          subtotal: '1.000 TL',
          deposit: '200 TL',
          tax: '180 TL',
          totalAmount: '1.180 TL',
          paymentStatus: 'unpaid',
          pdfUrl: 'https://canary-production-5a09.up.railway.app/invoices/001.pdf',
          paymentUrl: 'https://canary-production-5a09.up.railway.app/pay/001'
        });
        break;

      case 'payment-confirmation':
        result = await sendPaymentConfirmation(to, {
          customerName: 'Can Öztürk',
          amount: '1.180 TL',
          orderNumber: 'ORD-2025-002',
          transactionId: 'TXN-20250110-12345',
          paymentDate: '10 Ocak 2025, 15:30',
          paymentMethod: 'Kredi Kartı',
          cardLastDigits: '4567',
          receiptUrl: 'https://canary-production-5a09.up.railway.app/receipts/12345.pdf'
        });
        break;

      case 'late-payment':
        result = await sendLatePaymentWarning(to, {
          customerName: 'Ali Çelik',
          orderNumber: 'ORD-2025-003',
          invoiceNumber: 'INV-2025-003',
          overdueAmount: '1.500 TL',
          dueDate: '5 Ocak 2025',
          daysOverdue: 5,
          lateFee: '150 TL',
          paymentUrl: 'https://canary-production-5a09.up.railway.app/pay/003',
          contactPhone: '+90 555 123 4567'
        });
        break;

      case 'password-reset':
        result = await sendPasswordReset(to, {
          name: 'Test Kullanıcı',
          resetUrl: 'https://canary-production-5a09.up.railway.app/reset-password?token=abc123xyz',
          expiryHours: 24
        });
        break;

      case 'inspection-report':
        result = await sendInspectionReport(to, {
          customerName: 'Fatma Yıldız',
          orderNumber: 'ORD-2025-004',
          inspectionDate: '25 Ocak 2025',
          inspectionType: 'İade Kontrol',
          inspectorName: 'Serkan Demir',
          equipment: [
            { name: 'Sony A7III', serialNumber: 'SN123456', status: 'OK' },
            { name: 'Canon 24-70mm', serialNumber: 'SN789012', status: 'Issues', notes: 'Lens kapağında çizik var' },
            { name: 'Manfrotto Tripod', serialNumber: 'SN345678', status: 'OK' }
          ],
          hasIssues: true,
          damageCharge: '250 TL',
          inspectionUrl: 'https://canary-production-5a09.up.railway.app/inspections/004'
        });
        break;

      case 'monthly-summary':
        result = await sendMonthlySummary(to, {
          customerName: 'Mehmet Öz',
          monthName: 'Aralık',
          year: 2024,
          totalOrders: 8,
          totalDays: 45,
          totalAmount: '12.500 TL',
          equipmentCount: 12,
          topEquipment: [
            { name: 'Sony A7III', count: 5 },
            { name: 'DJI Mavic 3', count: 3 },
            { name: 'Canon 24-70mm', count: 4 }
          ],
          upcomingBookings: 2,
          detailsUrl: 'https://canary-production-5a09.up.railway.app/reports/monthly/2024-12'
        });
        break;

      case 'promotional':
        result = await sendPromotionalEmail(to, {
          customerName: 'Deniz Aydın',
          description: 'Şubat ayına özel tüm kamera ekipmanlarında geçerli indirim kampanyası!',
          promoCode: 'SUBAT2025',
          discountPercent: 20,
          minAmount: '500 TL',
          expiryDate: '28 Şubat 2025',
          terms: [
            'Kampanya 28 Şubat 2025 tarihine kadar geçerlidir',
            'Minimum 500 TL tutarındaki siparişlerde geçerlidir',
            'Diğer kampanyalarla birleştirilemez',
            'Sadece kamera ve lens ürünlerinde geçerlidir'
          ],
          bookingUrl: 'https://canary-production-5a09.up.railway.app/booking'
        });
        break;

      default:
        return res.status(400).json({ 
          error: 'Geçersiz template adı',
          availableTemplates: [
            'welcome',
            'order-confirmation',
            'pickup-reminder',
            'return-reminder',
            'invoice',
            'payment-confirmation',
            'late-payment',
            'password-reset',
            'inspection-report',
            'monthly-summary',
            'promotional'
          ]
        });
    }

    if (result.success) {
      res.json({
        success: true,
        message: `${templateName} email başarıyla gönderildi`,
        to,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get available email templates
 * GET /api/test-email
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    availableTemplates: [
      { name: 'welcome', description: 'Hoş geldin emaili' },
      { name: 'order-confirmation', description: 'Sipariş onay emaili' },
      { name: 'pickup-reminder', description: 'Teslim alma hatırlatması' },
      { name: 'return-reminder', description: 'İade hatırlatması' },
      { name: 'invoice', description: 'Fatura emaili' },
      { name: 'payment-confirmation', description: 'Ödeme onay emaili' },
      { name: 'late-payment', description: 'Gecikmiş ödeme uyarısı' },
      { name: 'password-reset', description: 'Şifre sıfırlama emaili' },
      { name: 'inspection-report', description: 'Kontrol raporu emaili' },
      { name: 'monthly-summary', description: 'Aylık özet rapor' },
      { name: 'promotional', description: 'Kampanya emaili' }
    ],
    usage: 'POST /api/test-email/:templateName with body { "to": "email@example.com" }'
  });
});

export default router;
