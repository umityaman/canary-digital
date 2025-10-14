import nodemailer from 'nodemailer';
import logger from './logger';

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

// Sipariş onayı emaili
export const sendOrderConfirmation = async (
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    equipment: string[];
    startDate: string;
    endDate: string;
    totalPrice: number;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Sipariş Onayı</h2>
      <p>Sayın ${orderDetails.customerName},</p>
      <p>Siparişiniz başarıyla oluşturuldu.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sipariş No:</strong> ${orderDetails.orderNumber}</p>
        <p><strong>Başlangıç:</strong> ${orderDetails.startDate}</p>
        <p><strong>Bitiş:</strong> ${orderDetails.endDate}</p>
        <p><strong>Ekipmanlar:</strong></p>
        <ul>
          ${orderDetails.equipment.map(eq => `<li>${eq}</li>`).join('')}
        </ul>
        <p><strong>Toplam Tutar:</strong> ${orderDetails.totalPrice} TL</p>
      </div>
      
      <p>Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Bu otomatik bir mesajdır, lütfen yanıtlamayın.
      </p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Sipariş Onayı - ${orderDetails.orderNumber}`,
    html,
  });
};

// Teknik servis bildirimi
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
