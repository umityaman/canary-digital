import nodemailer from 'nodemailer';
import logger from './logger';
import { compileTemplate } from '../services/emailTemplate.service';

// Gmail SMTP Configuration
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

// Create transporter
let transporter: nodemailer.Transporter | null = null;

if (EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD // Gmail App Password (16 haneli)
    }
  });
  logger.info('✅ Gmail SMTP initialized successfully');
} else {
  logger.warn('⚠️ EMAIL_USER or EMAIL_PASSWORD not found - email sending will fail');
}

// Email gönderme fonksiyonu - Gmail SMTP kullanıyor
export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter is not configured');
    }

    const mailOptions = {
      from: `Canary ERP <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || options.text || ''
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent via Gmail SMTP: ${info.messageId} to ${options.to}`);
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response
    };
  } catch (error: any) {
    logger.error(`❌ Gmail SMTP email failed: ${error.message}`, { 
      to: options.to, 
      error 
    });
    return { 
      success: false, 
      error: error.message
    };
  }
};

// ========== TEMPLATE-BASED EMAIL FUNCTIONS ==========

// 1. Welcome Email (User Registration)
export const sendWelcomeEmail = async (
  to: string,
  data: {
    name: string;
    email: string;
    companyName: string;
    loginUrl: string;
    supportUrl?: string;
    websiteUrl?: string;
  }
) => {
  const html = compileTemplate('welcome', data);
  return sendEmail({ 
    to, 
    subject: 'CANARY ERP\'ye Hoş Geldiniz! 🎉', 
    html 
  });
};

// 2. Order Confirmation Email
export const sendOrderConfirmation = async (
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    startDate: string;
    endDate: string;
    duration: number;
    equipment: Array<{ name: string; quantity: number; price: string }>;
    totalAmount: string;
    depositAmount?: string;
    deliveryMethod: string;
    deliveryAddress?: string;
    notes?: string;
    orderUrl: string;
  }
) => {
  const html = compileTemplate('order-confirmation', data);
  return sendEmail({ 
    to, 
    subject: `Sipariş Onayı - ${data.orderNumber}`, 
    html 
  });
};

// 3. Pickup Reminder Email (1 day before)
export const sendPickupReminder = async (
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    pickupDate: string;
    pickupTime: string;
    equipment: Array<{ name: string; quantity: number }>;
    pickupAddress: string;
    contactPhone: string;
    orderUrl: string;
  }
) => {
  const html = compileTemplate('pickup-reminder', data);
  return sendEmail({ 
    to, 
    subject: `Teslim Alma Hatırlatması - ${data.orderNumber}`, 
    html 
  });
};

// 4. Return Reminder Email
export const sendReturnReminder = async (
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    returnDate: string;
    returnTime: string;
    equipment: Array<{ name: string; quantity: number }>;
    returnAddress: string;
    contactPhone: string;
    lateFee?: string;
    orderUrl: string;
  }
) => {
  const html = compileTemplate('return-reminder', data);
  return sendEmail({ 
    to, 
    subject: `İade Hatırlatması - ${data.orderNumber}`, 
    html 
  });
};

// 5. Invoice Email
export const sendInvoice = async (
  to: string,
  data: {
    customerName: string;
    invoiceNumber: string;
    invoiceDate: string;
    orderNumber: string;
    companyName: string;
    companyAddress: string;
    companyTaxOffice: string;
    companyTaxNumber: string;
    items: Array<{ description: string; quantity: number; unitPrice: string; total: string }>;
    subtotal: string;
    deposit?: string;
    discount?: string;
    tax: string;
    totalAmount: string;
    paymentStatus: 'paid' | 'unpaid';
    pdfUrl: string;
    paymentUrl?: string;
  }
) => {
  const html = compileTemplate('invoice', data);
  return sendEmail({ 
    to, 
    subject: `Fatura - ${data.invoiceNumber}`, 
    html 
  });
};

// 6. Payment Confirmation Email
export const sendPaymentConfirmation = async (
  to: string,
  data: {
    customerName: string;
    amount: string;
    orderNumber: string;
    transactionId: string;
    paymentDate: string;
    paymentMethod: string;
    cardLastDigits?: string;
    receiptUrl: string;
  }
) => {
  const html = compileTemplate('payment-confirmation', data);
  return sendEmail({ 
    to, 
    subject: `Ödeme Alındı - ${data.orderNumber}`, 
    html 
  });
};

// 7. Late Payment Warning Email
export const sendLatePaymentWarning = async (
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    invoiceNumber: string;
    overdueAmount: string;
    dueDate: string;
    daysOverdue: number;
    lateFee: string;
    paymentUrl: string;
    contactPhone: string;
  }
) => {
  const html = compileTemplate('late-payment', data);
  return sendEmail({ 
    to, 
    subject: `⚠️ Ödeme Hatırlatması - ${data.orderNumber}`, 
    html 
  });
};

// 8. Password Reset Email
export const sendPasswordReset = async (
  to: string,
  data: {
    name: string;
    resetUrl: string;
    expiryHours: number;
  }
) => {
  const html = compileTemplate('password-reset', data);
  return sendEmail({ 
    to, 
    subject: 'Şifre Sıfırlama Talebi', 
    html 
  });
};

// 9. Inspection Report Email
export const sendInspectionReport = async (
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    inspectionDate: string;
    inspectionType: string;
    inspectorName: string;
    equipment: Array<{ 
      name: string; 
      serialNumber: string; 
      status: 'OK' | 'Issues'; 
      notes?: string 
    }>;
    hasIssues: boolean;
    damageCharge?: string;
    inspectionUrl: string;
  }
) => {
  const html = compileTemplate('inspection-report', data);
  return sendEmail({ 
    to, 
    subject: `Ekipman Kontrol Raporu - ${data.orderNumber}`, 
    html 
  });
};

// 10. Monthly Summary Email
export const sendMonthlySummary = async (
  to: string,
  data: {
    customerName: string;
    monthName: string;
    year: number;
    totalOrders: number;
    totalDays: number;
    totalAmount: string;
    equipmentCount: number;
    topEquipment?: Array<{ name: string; count: number }>;
    upcomingBookings?: number;
    detailsUrl: string;
  }
) => {
  const html = compileTemplate('monthly-summary', data);
  return sendEmail({ 
    to, 
    subject: `${data.monthName} Aylık Özet Rapor`, 
    html 
  });
};

// 11. Promotional/Campaign Email
export const sendPromotionalEmail = async (
  to: string,
  data: {
    customerName: string;
    description: string;
    promoCode: string;
    discountPercent: number;
    minAmount: string;
    expiryDate: string;
    terms?: string[];
    bookingUrl: string;
  }
) => {
  const html = compileTemplate('promotional', data);
  return sendEmail({ 
    to, 
    subject: '🎁 Sizin İçin Özel Kampanya!', 
    html 
  });
};

// ========== LEGACY FUNCTIONS (for backward compatibility) ==========

// Teknik servis bildirimi (eski fonksiyon - template'e çevrilmeli)
export const sendTechnicalServiceNotification = async (
  customerEmail: string,
  serviceDetails: {
    ticketNumber: string;
    customerName: string;
    equipment: string;
    status: string;
    description: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Teknik Servis Bildirimi</h2>
      <p>Sayın ${serviceDetails.customerName},</p>
      <p>Teknik servis talebiniz alındı.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket No:</strong> ${serviceDetails.ticketNumber}</p>
        <p><strong>Ekipman:</strong> ${serviceDetails.equipment}</p>
        <p><strong>Durum:</strong> ${serviceDetails.status}</p>
        <p><strong>Açıklama:</strong> ${serviceDetails.description}</p>
      </div>
      
      <p>En kısa sürede size dönüş yapacağız.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Bu otomatik bir mesajdır, lütfen yanıtlamayın.
      </p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Teknik Servis - ${serviceDetails.ticketNumber}`,
    html,
  });
};
