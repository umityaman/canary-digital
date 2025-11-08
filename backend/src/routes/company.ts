import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/company - Get current company information
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      console.warn('⚠️ GET /api/company - No companyId in token. Returning empty company data. User:', req.user?.id);
      return res.json({ 
        success: true,
        data: null,
        message: 'No company assigned to user'
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobilePhone: true,
        address: true,
        address2: true,
        city: true,
        district: true,
        postalCode: true,
        taxNumber: true,
        taxOffice: true,
        tradeRegister: true,
        mersisNo: true,
        website: true,
        logo: true,
        authorizedPerson: true,
        iban: true,
        bankName: true,
        bankBranch: true,
        accountHolder: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch company information' });
  }
});

/**
 * PUT /api/company - Update company information
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const {
      name,
      email,
      phone,
      mobilePhone,
      address,
      address2,
      city,
      district,
      postalCode,
      taxNumber,
      taxOffice,
      tradeRegister,
      mersisNo,
      website,
      logo,
      authorizedPerson,
      iban,
      bankName,
      bankBranch,
      accountHolder,
      timezone,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        email,
        phone,
        mobilePhone,
        address,
        address2,
        city,
        district,
        postalCode,
        taxNumber,
        taxOffice,
        tradeRegister,
        mersisNo,
        website,
        logo,
        authorizedPerson,
        iban,
        bankName,
        bankBranch,
        accountHolder,
        timezone,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobilePhone: true,
        address: true,
        address2: true,
        city: true,
        district: true,
        postalCode: true,
        taxNumber: true,
        taxOffice: true,
        tradeRegister: true,
        mersisNo: true,
        website: true,
        logo: true,
        authorizedPerson: true,
        iban: true,
        bankName: true,
        bankBranch: true,
        accountHolder: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(company);
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: error.message || 'Failed to update company information' });
  }
});

/**
 * GET /api/company/bank-accounts - Get all bank accounts for the company
 */
router.get('/bank-accounts', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      console.warn('⚠️ GET /api/company/bank-accounts - No companyId in token. Returning empty array. User:', req.user?.id);
      return res.json({ 
        success: true,
        data: [],
        message: 'No company assigned to user'
      });
    }

    const { isActive } = req.query;

    const where: any = { companyId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountType: true,
        iban: true,
        branch: true,
        branchCode: true,
        balance: true,
        availableBalance: true,
        blockedBalance: true,
        currency: true,
        isActive: true,
        lastReconciled: true,
        lastStatementDate: true,
        autoReconcile: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate totals
    const totals = {
      totalBalance: bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
      totalAvailable: bankAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0),
      totalBlocked: bankAccounts.reduce((sum, acc) => sum + (acc.blockedBalance || 0), 0),
      activeAccounts: bankAccounts.filter(acc => acc.isActive).length,
      totalAccounts: bankAccounts.length,
    };

    res.json({
      accounts: bankAccounts,
      totals,
    });
  } catch (error: any) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch bank accounts' });
  }
});

export default router;
