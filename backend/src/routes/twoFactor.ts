import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { TwoFactorService } from '../services/twoFactor.service';
import { SMSService } from '../services/sms.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get 2FA status
 * GET /api/2fa/status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await TwoFactorService.get2FAStatus(userId);
    res.json(status);
  } catch (error: any) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: error.message || '2FA durumu alınamadı' });
  }
});

/**
 * Enable 2FA
 * POST /api/2fa/enable
 * Body: { method: 'EMAIL' | 'SMS' | 'TOTP', phoneNumber?: string }
 */
router.post('/enable', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method, phoneNumber } = req.body;

    if (!method || !['EMAIL', 'SMS', 'TOTP'].includes(method)) {
      return res.status(400).json({ error: 'Geçersiz 2FA yöntemi' });
    }

    if (method === 'SMS' && !phoneNumber) {
      return res.status(400).json({ error: 'SMS için telefon numarası gerekli' });
    }

    // Get user details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    }

    let result: any = {};

    // Generate secret and QR code for TOTP
    if (method === 'TOTP') {
      const totpData = await TwoFactorService.generateTOTPSecret(userId, user.email);
      result = {
        secret: totpData.secret,
        qrCode: totpData.qrCode,
      };
      
      // Update user with method and secret (but don't enable yet)
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorMethod: method,
          twoFactorSecret: totpData.secret,
        },
      });
    } else {
      // For EMAIL and SMS, update method and phone
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorMethod: method,
          twoFactorPhone: phoneNumber || null,
        },
      });
    }

    // Generate backup codes
    const backupCodes = await TwoFactorService.generateBackupCodes(userId);
    result.backupCodes = backupCodes;

    res.json({
      message: '2FA başarıyla yapılandırıldı',
      ...result,
    });
  } catch (error: any) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: error.message || '2FA aktifleştirilemedi' });
  }
});

/**
 * Disable 2FA
 * POST /api/2fa/disable
 */
router.post('/disable', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await TwoFactorService.disable2FA(userId);

    res.json({ message: '2FA başarıyla devre dışı bırakıldı' });
  } catch (error: any) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: error.message || '2FA devre dışı bırakılamadı' });
  }
});

/**
 * Send OTP code
 * POST /api/2fa/send-otp
 */
router.post('/send-otp', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Send OTP based on method
    if (user.twoFactorMethod === 'EMAIL') {
      await TwoFactorService.sendEmailOTP(userId, user.email || '');
    } else if (user.twoFactorMethod === 'SMS') {
      const result = await TwoFactorService.sendEmailOTP(userId, user.email || ''); // Generate OTP
      if (user.twoFactorPhone) {
        await SMSService.sendOTP(user.twoFactorPhone, result.otp);
      }
    } else {
      return res.status(400).json({ error: 'TOTP için kod gönderilmez' });
    }

    res.json({ message: 'Doğrulama kodu gönderildi' });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: error.message || 'Kod gönderilemedi' });
  }
});

/**
 * Verify 2FA code
 * POST /api/2fa/verify
 * Body: { code: string, isBackupCode?: boolean }
 */
router.post('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, isBackupCode } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Kod gerekli' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    let isValid = false;

    // Verify based on backup code or method
    if (isBackupCode) {
      isValid = await TwoFactorService.verifyBackupCode(userId, code);
    } else if (user.twoFactorMethod === 'EMAIL' || user.twoFactorMethod === 'SMS') {
      isValid = await TwoFactorService.verifyEmailOTP(userId, code);
    } else if (user.twoFactorMethod === 'TOTP' && user.twoFactorSecret) {
      isValid = TwoFactorService.verifyTOTP(code, user.twoFactorSecret);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Geçersiz kod' });
    }

    // Enable 2FA if not already enabled
    if (!user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorVerifiedAt: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorVerifiedAt: new Date(),
        },
      });
    }

    res.json({ message: 'Doğrulama başarılı', verified: true });
  } catch (error: any) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ error: error.message || 'Doğrulama başarısız' });
  }
});

/**
 * Regenerate backup codes
 * POST /api/2fa/regenerate-backup-codes
 */
router.post('/regenerate-backup-codes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const backupCodes = await TwoFactorService.generateBackupCodes(userId);

    res.json({
      message: 'Yedek kodlar yenilendi',
      backupCodes,
    });
  } catch (error: any) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({ error: error.message || 'Yedek kodlar yenilenemedi' });
  }
});

export default router;
