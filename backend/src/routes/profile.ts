import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient() as any;

// Multer configuration for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// GET /api/profile - Get current user profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        title: true,
        avatar: true,
        role: true,
        
        // Notification Preferences
        emailOrders: true,
        emailCalendar: true,
        emailInventory: true,
        smsOrders: true,
        smsReminders: true,
        pushNotifications: true,
        notificationFrequency: true,
        
        // Appearance Preferences
        theme: true,
        language: true,
        dateFormat: true,
        timeFormat: true,
        currency: true,
        
        // Integrations
        googleCalendarEnabled: true,
        googleCalendarId: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            taxNumber: true,
            tradeRegister: true,
            city: true,
            district: true,
            postalCode: true,
            website: true,
          }
        },
        
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, phone, title } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        title,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        title: true,
        avatar: true,
        updatedAt: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', (upload.single('avatar') as any), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (user?.avatar) {
      const oldPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        avatar: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// DELETE /api/profile/avatar - Delete avatar
router.delete('/avatar', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (user?.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

// POST /api/profile/change-password - Change password
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============================================
// COMPANY ENDPOINTS
// ============================================

// PUT /api/profile/company - Update company info
router.put('/company', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      name,
      email,
      phone,
      address,
      city,
      district,
      postalCode,
      website,
      taxNumber,
      tradeRegister,
    } = req.body;

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, role: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: 'No company associated with user' });
    }

    // Only ADMIN can update company info
    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name,
        email,
        phone,
        address,
        city,
        district,
        postalCode,
        website,
        taxNumber,
        tradeRegister,
      },
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

// PUT /api/profile/notifications - Update notification preferences
router.put('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      emailOrders,
      emailCalendar,
      emailInventory,
      smsOrders,
      smsReminders,
      pushNotifications,
      notificationFrequency,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailOrders,
        emailCalendar,
        emailInventory,
        smsOrders,
        smsReminders,
        pushNotifications,
        notificationFrequency,
      },
      select: {
        emailOrders: true,
        emailCalendar: true,
        emailInventory: true,
        smsOrders: true,
        smsReminders: true,
        pushNotifications: true,
        notificationFrequency: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// ============================================
// APPEARANCE PREFERENCES
// ============================================

// PUT /api/profile/appearance - Update appearance preferences
router.put('/appearance', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      theme,
      language,
      dateFormat,
      timeFormat,
      currency,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        theme,
        language,
        dateFormat,
        timeFormat,
        currency,
      },
      select: {
        theme: true,
        language: true,
        dateFormat: true,
        timeFormat: true,
        currency: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating appearance:', error);
    res.status(500).json({ error: 'Failed to update appearance preferences' });
  }
});

// ============================================
// INTEGRATIONS
// ============================================

// PUT /api/profile/integrations/google-calendar - Update Google Calendar integration
router.put('/integrations/google-calendar', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { enabled, calendarId } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarEnabled: enabled,
        googleCalendarId: calendarId || null,
      },
      select: {
        googleCalendarEnabled: true,
        googleCalendarId: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating Google Calendar integration:', error);
    res.status(500).json({ error: 'Failed to update Google Calendar integration' });
  }
});

// PUT /api/profile/integrations/whatsapp - Update WhatsApp integration
router.put('/integrations/whatsapp', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { enabled, number } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        whatsappEnabled: enabled,
        whatsappNumber: number || null,
      },
      select: {
        whatsappEnabled: true,
        whatsappNumber: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating WhatsApp integration:', error);
    res.status(500).json({ error: 'Failed to update WhatsApp integration' });
  }
});

// POST /api/profile/export-data - Export user data (GDPR compliance)
router.post('/export-data', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        inspections: true,
        assignedEvents: true,
        workOrders: true,
      }
    });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    const { password, googleAccessToken, googleRefreshToken, ...safeData } = userData;

    res.json({
      exportDate: new Date().toISOString(),
      data: safeData,
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// GET /api/profile/activity-stats - Get user activity statistics
router.get('/activity-stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const [
      inspectionCount,
      assignedEventCount,
      workOrderCount,
    ] = await Promise.all([
      prisma.inspection.count({ where: { inspectorId: userId } }),
      prisma.calendarEvent.count({ where: { assignedToId: userId } }),
      prisma.workOrder.count({ where: { assignedToId: userId } }),
    ]);

    res.json({
      totalInspections: inspectionCount,
      assignedEvents: assignedEventCount,
      workOrders: workOrderCount,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

// ============================================
// COMPANY PROFILE ENDPOINTS
// ============================================

// GET /api/profile/company - Get company profile
router.get('/company', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      logo: user.company.logo || '',
      name: user.company.name || '',
      addressLine1: user.company.address || '',
      addressLine2: user.company.address2 || '',
      country: 'Türkiye',
      city: user.company.city || '',
      district: user.company.district || '',
      postalCode: user.company.postalCode || '',
      mobilePhone: user.company.mobilePhone || '',
      landlinePhone: user.company.phone || '',
      email: user.company.email || '',
      website: user.company.website || '',
      taxNumber: user.company.taxNumber || '',
      taxOffice: user.company.taxOffice || '',
      tradeRegistryNo: user.company.tradeRegister || '',
      mersisNo: user.company.mersisNo || '',
      iban: user.company.iban || '',
      bankName: user.company.bankName || '',
      bankBranch: user.company.bankBranch || '',
      accountHolder: user.company.accountHolder || '',
      authorizedPerson: user.company.authorizedPerson || '',
      timezone: user.company.timezone || 'Europe/Istanbul',
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// PUT /api/profile/company - Update company profile
router.put('/company', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      name,
      addressLine1,
      addressLine2,
      city,
      district,
      postalCode,
      mobilePhone,
      landlinePhone,
      email,
      website,
      taxNumber,
      taxOffice,
      tradeRegistryNo,
      mersisNo,
      iban,
      bankName,
      bankBranch,
      accountHolder,
      authorizedPerson,
      timezone,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user || !user.companyId) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name,
        address: addressLine1,
        address2: addressLine2,
        city,
        district,
        postalCode,
        mobilePhone,
        phone: landlinePhone,
        email,
        website,
        taxNumber,
        taxOffice,
        tradeRegister: tradeRegistryNo,
        mersisNo,
        iban,
        bankName,
        bankBranch,
        accountHolder,
        authorizedPerson,
        timezone,
      }
    });

    res.json({
      logo: updatedCompany.logo || '',
      name: updatedCompany.name || '',
      addressLine1: updatedCompany.address || '',
      addressLine2: updatedCompany.address2 || '',
      country: 'Türkiye',
      city: updatedCompany.city || '',
      district: updatedCompany.district || '',
      postalCode: updatedCompany.postalCode || '',
      mobilePhone: updatedCompany.mobilePhone || '',
      landlinePhone: updatedCompany.phone || '',
      email: updatedCompany.email || '',
      website: updatedCompany.website || '',
      taxNumber: updatedCompany.taxNumber || '',
      taxOffice: updatedCompany.taxOffice || '',
      tradeRegistryNo: updatedCompany.tradeRegister || '',
      mersisNo: updatedCompany.mersisNo || '',
      iban: updatedCompany.iban || '',
      bankName: updatedCompany.bankName || '',
      bankBranch: updatedCompany.bankBranch || '',
      accountHolder: updatedCompany.accountHolder || '',
      authorizedPerson: updatedCompany.authorizedPerson || '',
      timezone: updatedCompany.timezone || 'Europe/Istanbul',
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

// Logo upload configuration
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and SVG are allowed.'));
    }
  }
});

// POST /api/profile/upload-logo - Upload company logo
router.post('/upload-logo', (logoUpload.single('logo') as any), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, company: true }
    });

    if (!user || !user.companyId) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Delete old logo if exists
    if (user.company?.logo) {
      const oldLogoPath = path.join(__dirname, '../../uploads/logos', path.basename(user.company.logo));
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    await prisma.company.update({
      where: { id: user.companyId },
      data: { logo: logoUrl }
    });

    res.json({ logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// ============================================
// COMPANY PROFILE ENDPOINTS
// ============================================

// GET /api/profile/company - Get company profile
router.get('/company', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user || !user.companyId) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// PUT /api/profile/company - Update company profile
router.put('/company', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      name,
      addressLine1,
      addressLine2,
      city,
      district,
      postalCode,
      country,
      mobilePhone,
      landlinePhone,
      email,
      website,
      taxNumber,
      taxOffice,
      tradeRegistryNo,
      mersisNo,
      iban,
      bankName,
      bankBranch,
      accountHolder,
      authorizedPerson,
      timezone,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user || !user.companyId) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name,
        addressLine1,
        addressLine2,
        city,
        district,
        postalCode,
        country,
        mobilePhone,
        landlinePhone,
        email,
        website,
        taxNumber,
        taxOffice,
        tradeRegistryNo,
        mersisNo,
        iban,
        bankName,
        bankBranch,
        accountHolder,
        authorizedPerson,
        timezone,
      }
    });

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

export default router;
