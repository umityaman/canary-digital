import twilio from 'twilio';
import logger from '../config/logger';

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox default

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio Client
export const initializeTwilio = () => {
  if (!accountSid || !authToken) {
    logger.warn('⚠️  Twilio credentials not found. WhatsApp features disabled.');
    return false;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    logger.info('✅ Twilio WhatsApp initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Twilio initialization failed:', error);
    return false;
  }
};

// Message Templates
export const messageTemplates = {
  orderConfirmation: (data: {
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    pickupDate: string;
    returnDate: string;
  }) => `
Merhaba ${data.customerName}! 🎉

Siparişiniz başarıyla oluşturuldu.

📋 *Sipariş No:* ${data.orderNumber}
💰 *Tutar:* ${data.totalAmount.toLocaleString('tr-TR')} TL
📅 *Alış:* ${data.pickupDate}
📅 *İade:* ${data.returnDate}

Siparişiniz hazırlanıyor. Alış tarihinde ekipmanlarınız hazır olacak.

Teşekkürler! 🙏
`,

  pickupReminder: (data: {
    customerName: string;
    orderNumber: string;
    pickupDate: string;
    pickupTime?: string;
    equipmentCount: number;
  }) => `
Merhaba ${data.customerName}! 📦

*Alış Hatırlatması*

Bugün ekipman alış gününüz!

📋 *Sipariş:* ${data.orderNumber}
🕐 *Saat:* ${data.pickupTime || '09:00 - 18:00'}
📦 *Ekipman:* ${data.equipmentCount} adet

Lütfen geç kalmayın. Gecikmeler için +90 XXX XXX XX XX'den bize ulaşın.

İyi çalışmalar! ⚡
`,

  returnReminder: (data: {
    customerName: string;
    orderNumber: string;
    returnDate: string;
    returnTime?: string;
    equipmentCount: number;
  }) => `
Merhaba ${data.customerName}! 🔄

*İade Hatırlatması*

Bugün ekipman iade gününüz!

📋 *Sipariş:* ${data.orderNumber}
🕐 *Saat:* ${data.returnTime || '09:00 - 18:00'}
📦 *İade Edilecek:* ${data.equipmentCount} adet

Ekipmanları temiz ve çalışır durumda getirmeyi unutmayın.

Teşekkürler! 🙏
`,

  paymentReminder: (data: {
    customerName: string;
    orderNumber: string;
    dueAmount: number;
    dueDate: string;
    daysOverdue?: number;
  }) => `
Merhaba ${data.customerName}! 💳

*Ödeme Hatırlatması*

📋 *Sipariş:* ${data.orderNumber}
💰 *Kalan Tutar:* ${data.dueAmount.toLocaleString('tr-TR')} TL
📅 *Son Tarih:* ${data.dueDate}
${data.daysOverdue ? `⚠️ *Gecikme:* ${data.daysOverdue} gün` : ''}

Lütfen ödemenizi en kısa sürede yapın.

Banka Bilgileri:
Canary Ekipman Kiralama
IBAN: TR00 0000 0000 0000 0000 0000 00

Teşekkürler! 🙏
`,

  paymentConfirmation: (data: {
    customerName: string;
    orderNumber: string;
    paidAmount: number;
    paymentMethod: string;
    receiptUrl?: string;
  }) => `
Merhaba ${data.customerName}! ✅

*Ödeme Alındı*

Ödemeniz başarıyla alındı!

📋 *Sipariş:* ${data.orderNumber}
💰 *Tutar:* ${data.paidAmount.toLocaleString('tr-TR')} TL
💳 *Yöntem:* ${data.paymentMethod}

${data.receiptUrl ? `🧾 Makbuz: ${data.receiptUrl}` : ''}

Teşekkür ederiz! 🎉
`,

  invoiceSent: (data: {
    customerName: string;
    invoiceNumber: string;
    invoiceUrl: string;
    totalAmount: number;
    dueDate: string;
  }) => `
Merhaba ${data.customerName}! 📄

*Fatura Gönderildi*

Faturanız hazırlandı.

🧾 *Fatura No:* ${data.invoiceNumber}
💰 *Tutar:* ${data.totalAmount.toLocaleString('tr-TR')} TL
📅 *Vade:* ${data.dueDate}

🔗 Faturayı görüntüle:
${data.invoiceUrl}

Teşekkürler! 🙏
`,

  latePaymentWarning: (data: {
    customerName: string;
    orderNumber: string;
    overdueAmount: number;
    daysOverdue: number;
    lateFeePossible?: boolean;
  }) => `
Merhaba ${data.customerName}! ⚠️

*Ödeme Gecikmesi Uyarısı*

Ödemeniz ${data.daysOverdue} gün gecikmiş durumda.

📋 *Sipariş:* ${data.orderNumber}
💰 *Geciken Tutar:* ${data.overdueAmount.toLocaleString('tr-TR')} TL
⏰ *Gecikme:* ${data.daysOverdue} gün

${data.lateFeePossible ? '⚠️ Gecikme ücreti uygulanabilir.\n\n' : ''}Lütfen en kısa sürede ödemenizi yapın veya bize ulaşın.

☎️ +90 XXX XXX XX XX

Anlayışınız için teşekkürler.
`,

  orderCancelled: (data: {
    customerName: string;
    orderNumber: string;
    cancellationReason?: string;
    refundAmount?: number;
  }) => `
Merhaba ${data.customerName}! ❌

*Sipariş İptal Edildi*

Siparişiniz iptal edildi.

📋 *Sipariş No:* ${data.orderNumber}
${data.cancellationReason ? `📝 *Sebep:* ${data.cancellationReason}\n` : ''}${data.refundAmount ? `💰 *İade Tutarı:* ${data.refundAmount.toLocaleString('tr-TR')} TL\n` : ''}
${data.refundAmount ? 'İade işlemi 3-5 iş günü içinde hesabınıza yansıyacak.\n\n' : ''}Başka bir konuda yardımcı olabilirsek lütfen bize ulaşın.

Teşekkürler! 🙏
`,

  welcomeMessage: (data: {
    customerName: string;
    companyName: string;
  }) => `
Merhaba ${data.customerName}! 👋

*${data.companyName}'e Hoş Geldiniz!*

Kayıt işleminiz tamamlandı. Artık tüm ekipmanlarımıza erişebilirsiniz.

✨ *Avantajlarınız:*
• Profesyonel ekipman kiralama
• Hızlı teslimat
• 7/24 müşteri desteği
• Özel fiyatlandırma seçenekleri

Sorularınız için:
☎️ +90 XXX XXX XX XX
📧 destek@canary.com

İyi çalışmalar! 🚀
`,

  equipmentDamageReport: (data: {
    customerName: string;
    orderNumber: string;
    equipmentName: string;
    damageDescription: string;
    estimatedCost?: number;
  }) => `
Merhaba ${data.customerName}! ⚠️

*Hasar Raporu*

Kiralamış olduğunuz ekipmanda hasar tespit edildi.

📋 *Sipariş:* ${data.orderNumber}
🔧 *Ekipman:* ${data.equipmentName}
📝 *Hasar:* ${data.damageDescription}
${data.estimatedCost ? `💰 *Tahmini Tamir:* ${data.estimatedCost.toLocaleString('tr-TR')} TL\n` : ''}
Detaylı bilgi için sizinle iletişime geçeceğiz.

Anlayışınız için teşekkürler.
`,
};

// Send WhatsApp Message
export const sendWhatsAppMessage = async (
  to: string,
  message: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> => {
  if (!twilioClient) {
    logger.warn('Twilio client not initialized. Skipping WhatsApp message.');
    return {
      success: false,
      error: 'Twilio client not initialized',
    };
  }

  try {
    // Format phone number for WhatsApp
    let formattedPhone = to.trim();
    
    // Remove any non-digit characters except +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
    
    // Add +90 if no country code
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('90')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+90' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+90' + formattedPhone;
      }
    }
    
    // Add whatsapp: prefix
    const whatsappPhone = `whatsapp:${formattedPhone}`;

    logger.info(`Sending WhatsApp message to ${whatsappPhone}`);

    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: whatsappNumber,
      to: whatsappPhone,
    });

    logger.info(`✅ WhatsApp message sent: ${messageResponse.sid}`);

    return {
      success: true,
      messageSid: messageResponse.sid,
    };
  } catch (error: any) {
    logger.error('❌ Failed to send WhatsApp message:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
};

// Send Order Confirmation
export const sendOrderConfirmationWhatsApp = async (data: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  totalAmount: number;
  pickupDate: string;
  returnDate: string;
}) => {
  const message = messageTemplates.orderConfirmation({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    totalAmount: data.totalAmount,
    pickupDate: data.pickupDate,
    returnDate: data.returnDate,
  });

  return await sendWhatsAppMessage(data.customerPhone, message);
};

// Send Pickup Reminder
export const sendPickupReminderWhatsApp = async (data: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  pickupDate: string;
  pickupTime?: string;
  equipmentCount: number;
}) => {
  const message = messageTemplates.pickupReminder({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
    equipmentCount: data.equipmentCount,
  });

  return await sendWhatsAppMessage(data.customerPhone, message);
};

// Send Return Reminder
export const sendReturnReminderWhatsApp = async (data: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  returnDate: string;
  returnTime?: string;
  equipmentCount: number;
}) => {
  const message = messageTemplates.returnReminder({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    returnDate: data.returnDate,
    returnTime: data.returnTime,
    equipmentCount: data.equipmentCount,
  });

  return await sendWhatsAppMessage(data.customerPhone, message);
};

// Send Payment Reminder
export const sendPaymentReminderWhatsApp = async (data: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  dueAmount: number;
  dueDate: string;
  daysOverdue?: number;
}) => {
  const message = messageTemplates.paymentReminder({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    dueAmount: data.dueAmount,
    dueDate: data.dueDate,
    daysOverdue: data.daysOverdue,
  });

  return await sendWhatsAppMessage(data.customerPhone, message);
};

// Send Payment Confirmation
export const sendPaymentConfirmationWhatsApp = async (data: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  paidAmount: number;
  paymentMethod: string;
  receiptUrl?: string;
}) => {
  const message = messageTemplates.paymentConfirmation({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    paidAmount: data.paidAmount,
    paymentMethod: data.paymentMethod,
    receiptUrl: data.receiptUrl,
  });

  return await sendWhatsAppMessage(data.customerPhone, message);
};

// Test WhatsApp Service
export const testWhatsAppService = async (phoneNumber: string) => {
  const testMessage = `
🧪 *Test Mesajı*

Bu bir test mesajıdır. WhatsApp entegrasyonu başarıyla çalışıyor!

✅ Twilio connected
✅ Messages working
✅ All systems go!

Canary Equipment Rental 🐤
`;

  return await sendWhatsAppMessage(phoneNumber, testMessage);
};

export default {
  initializeTwilio,
  sendWhatsAppMessage,
  sendOrderConfirmationWhatsApp,
  sendPickupReminderWhatsApp,
  sendReturnReminderWhatsApp,
  sendPaymentReminderWhatsApp,
  sendPaymentConfirmationWhatsApp,
  testWhatsAppService,
  messageTemplates,
};
