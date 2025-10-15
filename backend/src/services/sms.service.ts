import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client if credentials are available
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * SMS Service using Twilio
 */
export class SMSService {
  /**
   * Check if SMS service is configured
   */
  static isConfigured(): boolean {
    return !!(twilioClient && fromNumber);
  }

  /**
   * Send OTP code via SMS
   */
  static async sendOTP(phoneNumber: string, code: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('SMS servisi yapılandırılmamış');
    }

    if (!twilioClient || !fromNumber) {
      throw new Error('Twilio client bulunamadı');
    }

    try {
      // Format phone number (ensure it starts with +)
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+90${phoneNumber.replace(/^0/, '')}`;

      await twilioClient.messages.create({
        body: `Canary Rental doğrulama kodunuz: ${code}\n\nBu kodu kimseyle paylaşmayın.`,
        from: fromNumber,
        to: formattedNumber,
      });

      console.log(`SMS sent to ${formattedNumber}`);
    } catch (error: any) {
      console.error('SMS sending error:', error);
      throw new Error(`SMS gönderilemedi: ${error.message}`);
    }
  }

  /**
   * Send verification SMS
   */
  static async sendVerification(phoneNumber: string, userName: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('SMS servisi yapılandırılmamış');
    }

    if (!twilioClient || !fromNumber) {
      throw new Error('Twilio client bulunamadı');
    }

    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+90${phoneNumber.replace(/^0/, '')}`;

      await twilioClient.messages.create({
        body: `Merhaba ${userName},\n\nCanary Rental hesabınız için iki faktörlü doğrulama başarıyla aktifleştirildi.`,
        from: fromNumber,
        to: formattedNumber,
      });
    } catch (error: any) {
      console.error('SMS sending error:', error);
      // Don't throw error for notification SMS
    }
  }
}
