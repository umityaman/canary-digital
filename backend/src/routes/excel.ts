import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import excelService from '../services/excelService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/excel/export/invoices - Export invoices to Excel
 */
router.get('/export/invoices', async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { startDate, endDate, status } = req.query;

    const workbook = await excelService.exportInvoices(companyId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as string
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=faturalar.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({ message: error.message || 'Failed to export invoices' });
  }
});

/**
 * GET /api/excel/export/expenses - Export expenses to Excel
 */
router.get('/export/expenses', async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { startDate, endDate, category } = req.query;

    const workbook = await excelService.exportExpenses(companyId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      category: category as string
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=giderler.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ message: error.message || 'Failed to export expenses' });
  }
});

/**
 * GET /api/excel/export/stock-movements - Export stock movements to Excel
 */
router.get('/export/stock-movements', async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const { startDate, endDate, productId } = req.query;

    const workbook = await excelService.exportStockMovements(companyId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      productId: productId ? parseInt(productId as string) : undefined
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stok-hareketleri.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error exporting stock movements:', error);
    res.status(500).json({ message: error.message || 'Failed to export stock movements' });
  }
});

/**
 * POST /api/excel/import/customers - Import customers from Excel
 */
router.post('/import/customers', upload.single('file'), async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = await excelService.importCustomers(companyId, req.file.buffer);
    res.json(results);
  } catch (error: any) {
    console.error('Error importing customers:', error);
    res.status(500).json({ message: error.message || 'Failed to import customers' });
  }
});

/**
 * POST /api/excel/import/products - Import products from Excel
 */
router.post('/import/products', upload.single('file'), async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = await excelService.importProducts(companyId, req.file.buffer);
    res.json(results);
  } catch (error: any) {
    console.error('Error importing products:', error);
    res.status(500).json({ message: error.message || 'Failed to import products' });
  }
});

/**
 * GET /api/excel/templates/customers - Download customer template
 */
router.get('/templates/customers', async (req, res) => {
  try {
    const workbook = await excelService.generateCustomerTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=musteri-sablonu.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error generating customer template:', error);
    res.status(500).json({ message: error.message || 'Failed to generate template' });
  }
});

/**
 * GET /api/excel/templates/products - Download product template
 */
router.get('/templates/products', async (req, res) => {
  try {
    const workbook = await excelService.generateProductTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=urun-sablonu.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error generating product template:', error);
    res.status(500).json({ message: error.message || 'Failed to generate template' });
  }
});

export default router;
