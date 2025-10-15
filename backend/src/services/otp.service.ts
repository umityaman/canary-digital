import crypto from 'crypto';

/**
 * OTP Service
 * Generates and validates One-Time Passwords
 */
export class OTPService {
  /**
   * Generate a random 6-digit OTP
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    
    return otp;
  }

  /**
   * Generate secure backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      // Format as XXXX-XXXX
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
      codes.push(formatted);
    }
    
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  static hashBackupCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string, hashedCode: string): boolean {
    const hash = this.hashBackupCode(code);
    return hash === hashedCode;
  }

  /**
   * Generate OTP expiry timestamp (5 minutes from now)
   */
  static getOTPExpiry(minutes: number = 5): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Check if OTP is expired
   */
  static isOTPExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}
