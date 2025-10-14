import { Router } from 'express';
import { sendEmail, sendOrderConfirmation, sendTechnicalServiceNotification } from '../utils/emailService';

const router = Router();

// Test email endpoint
router.post('/email', async (req, res) => {
  try {
    const { to } = req.body;
    
    const result = await sendEmail({
      to: to || 'seyyahyaman@gmail.com',
      subject: '🎉 Canary Email Test - Başarılı!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937;">✅ Email Servisi Çalışıyor!</h1>
          <p>Tebrikler! Canary ERP sisteminizin email servisi başarıyla yapılandırıldı.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📧 Test Detayları:</h3>
            <ul>
              <li><strong>Gönderen:</strong> ${process.env.EMAIL_USER || 'Not configured'}</li>
              <li><strong>Servis:</strong> Gmail SMTP</li>
              <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
              <li><strong>Durum:</strong> Başarılı ✅</li>
            </ul>
          </div>
          
          <p>Artık sipariş onayları, teknik servis bildirimleri ve diğer otomatik email'ler gönderilebilir.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 12px;">
            Bu bir test mesajıdır. Canary ERP - Equipment Rental Management System
          </p>
        </div>
      `
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email başarıyla gönderildi!',
        to: to || 'seyyahyaman@gmail.com',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test order confirmation email
router.post('/order-email', async (req, res) => {
  try {
    const result = await sendOrderConfirmation(
      'seyyahyaman@gmail.com',
      {
        orderNumber: 'ORD-TEST-001',
        customerName: 'Test Kullanıcı',
        equipment: ['Sony A7III Kamera', 'Canon 24-70mm Lens', 'Manfrotto Tripod'],
        startDate: '15 Ekim 2025',
        endDate: '20 Ekim 2025',
        totalPrice: 5000
      }
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Sipariş onay emaili başarıyla gönderildi!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test technical service notification email
router.post('/techservice-email', async (req, res) => {
  try {
    const result = await sendTechnicalServiceNotification(
      'seyyahyaman@gmail.com',
      {
        ticketNumber: 'TKT-TEST-001',
        customerName: 'Test Kullanıcı',
        equipment: 'Sony A7III Kamera',
        status: 'İşleme Alındı',
        description: 'Kamera sensöründe toz partikülleri tespit edildi. Temizleme işlemi başlatıldı.'
      }
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Teknik servis bildirimi başarıyla gönderildi!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
