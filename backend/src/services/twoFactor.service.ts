import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { OTPService } from './otp.service';
import { sendEmail } from '../utils/emailService';

const prisma = new PrismaClient() as any;

interface TwoFactorSecret {
  secret: string;
  qrCode: string;
}

/**
 * Two-Factor Authentication Service
 */
export class TwoFactorService {
  /**
   * Generate TOTP secret and QR code for Google Authenticator
   */
  static async generateTOTPSecret(
    userId: number,
    email: string
  ): Promise<TwoFactorSecret> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Canary (${email})`,
      issuer: 'Canary Rental System',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTP(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after
    });
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: number, secret: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      },
    });
  }

  /**
   * Generate and save backup codes
   */
  static async generateBackupCodes(userId: number): Promise<string[]> {
    const codes = OTPService.generateBackupCodes(10);
    
    // Hash codes before storing
    const hashedCodes = codes.map(code => OTPService.hashBackupCode(code));
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: JSON.stringify(hashedCodes),
      },
    });
    
    return codes; // Return unhashed codes to show user
  }

  /**
   * Verify backup code and mark as used
   */
  static async verifyBackupCode(
    userId: number,
    code: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user || !user.backupCodes) {
      return false;
    }

    const backupCodes = JSON.parse(user.backupCodes) as string[];
    if (backupCodes.length === 0) {
      return false;
    }

    // Check if code matches any stored code
    const codeIndex = backupCodes.findIndex(hashedCode =>
      OTPService.verifyBackupCode(code, hashedCode)
    );

    if (codeIndex === -1) {
      return false;
    }

    // Remove used code
    const updatedCodes = [...backupCodes];
    updatedCodes.splice(codeIndex, 1);

    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: updatedCodes.length > 0 ? JSON.stringify(updatedCodes) : null,
      },
    });

    return true;
  }

  /**
   * Send OTP via email
   */
  static async sendEmailOTP(
    userId: number,
    email: string
  ): Promise<{ otp: string; expiresAt: Date }> {
    const otp = OTPService.generateOTP(6);
    const expiresAt = OTPService.getOTPExpiry(5);

    // Store OTP in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        tempOTP: otp,
        tempOTPExpiry: expiresAt,
      },
    });

    // Send email
    await sendEmail({
      to: email,
      subject: 'Canary - Doğrulama Kodu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px dashed #1e40af; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Doğrulama Kodu</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Hesabınıza giriş yapmak için doğrulama kodunuz:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                  Bu kod <strong>5 dakika</strong> geçerlidir.
                </p>
              </div>

              <div class="warning">
                <strong>⚠️ Güvenlik Uyarısı:</strong><br>
                Bu kodu kimseyle paylaşmayın. Canary ekibi asla sizden bu kodu istemez.
              </div>

              <p>Eğer bu işlemi siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.</p>
            </div>
            <div class="footer">
              <p>© 2025 Canary Equipment Rental. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { otp, expiresAt };
  }

  /**
   * Verify email OTP
   */
  static async verifyEmailOTP(userId: number, otp: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tempOTP: true,
        tempOTPExpiry: true,
      },
    });

    if (!user || !user.tempOTP || !user.tempOTPExpiry) {
      return false;
    }

    // Check expiry
    if (OTPService.isOTPExpired(user.tempOTPExpiry)) {
      // Clear expired OTP
      await prisma.user.update({
        where: { id: userId },
        data: {
          tempOTP: null,
          tempOTPExpiry: null,
        },
      });
      return false;
    }

    // Verify OTP
    const isValid = user.tempOTP === otp;

    if (isValid) {
      // Clear OTP after successful verification
      await prisma.user.update({
        where: { id: userId },
        data: {
          tempOTP: null,
          tempOTPExpiry: null,
        },
      });
    }

    return isValid;
  }

  /**
   * Check if user has 2FA enabled
   */
  static async is2FAEnabled(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return user?.twoFactorEnabled || false;
  }

  /**
   * Get 2FA status for user
   */
  static async get2FAStatus(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    const backupCodes = user?.backupCodes ? JSON.parse(user.backupCodes) as string[] : [];
    
    return {
      enabled: user?.twoFactorEnabled || false,
      hasBackupCodes: backupCodes.length > 0,
      backupCodesCount: backupCodes.length,
    };
  }
}
