import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Excel Import/Export Service
 * Handles bulk data import/export operations with Excel files
 */
export class ExcelService {
  /**
   * Export invoices to Excel
   */
  async exportInvoices(companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    try {
      const where: any = { companyId };

      if (filters?.startDate || filters?.endDate) {
        where.invoiceDate = {};
        if (filters.startDate) where.invoiceDate.gte = filters.startDate;
        if (filters.endDate) where.invoiceDate.lte = filters.endDate;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          items: true
        },
        orderBy: { invoiceDate: 'desc' }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Faturalar');

      // Define columns
      worksheet.columns = [
        { header: 'Fatura No', key: 'invoiceNumber', width: 15 },
        { header: 'Müşteri', key: 'customer', width: 30 },
        { header: 'Tarih', key: 'date', width: 12 },
        { header: 'Vade Tarihi', key: 'dueDate', width: 12 },
        { header: 'Ara Toplam', key: 'subtotal', width: 15 },
        { header: 'KDV', key: 'vat', width: 15 },
        { header: 'Toplam', key: 'total', width: 15 },
        { header: 'Para Birimi', key: 'currency', width: 10 },
        { header: 'Durum', key: 'status', width: 12 },
        { header: 'Açıklama', key: 'description', width: 40 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };

      // Add data
      invoices.forEach(invoice => {
        worksheet.addRow({
          invoiceNumber: invoice.invoiceNumber,
          customer: invoice.customer.name,
          date: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          vat: invoice.vatAmount,
          total: invoice.total,
          currency: invoice.currency,
          status: invoice.status,
          description: invoice.description
        });
      });

      // Format currency columns
      ['subtotal', 'vat', 'total'].forEach(col => {
        worksheet.getColumn(col).numFmt = '#,##0.00';
      });

      // Format date columns
      ['date', 'dueDate'].forEach(col => {
        worksheet.getColumn(col).numFmt = 'dd/mm/yyyy';
      });

      logger.info(`Exported ${invoices.length} invoices to Excel`);
      return workbook;
    } catch (error: any) {
      logger.error('Error exporting invoices to Excel:', error);
      throw error;
    }
  }

  /**
   * Export expenses to Excel
   */
  async exportExpenses(companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }) {
    try {
      const where: any = { companyId };

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      if (filters?.category) {
        where.category = filters.category;
      }

      const expenses = await prisma.expense.findMany({
        where,
        include: {
          supplier: true
        },
        orderBy: { date: 'desc' }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Giderler');

      // Define columns
      worksheet.columns = [
        { header: 'Tarih', key: 'date', width: 12 },
        { header: 'Tedarikçi', key: 'supplier', width: 30 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Açıklama', key: 'description', width: 40 },
        { header: 'Tutar', key: 'amount', width: 15 },
        { header: 'KDV', key: 'vat', width: 15 },
        { header: 'Toplam', key: 'total', width: 15 },
        { header: 'Ödeme Yöntemi', key: 'paymentMethod', width: 15 },
        { header: 'Durum', key: 'status', width: 12 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF44336' }
      };

      // Add data
      expenses.forEach(expense => {
        worksheet.addRow({
          date: expense.date,
          supplier: expense.supplier?.name || 'N/A',
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          vat: expense.vatAmount,
          total: expense.total,
          paymentMethod: expense.paymentMethod,
          status: expense.status
        });
      });

      // Format columns
      worksheet.getColumn('date').numFmt = 'dd/mm/yyyy';
      ['amount', 'vat', 'total'].forEach(col => {
        worksheet.getColumn(col).numFmt = '#,##0.00';
      });

      logger.info(`Exported ${expenses.length} expenses to Excel`);
      return workbook;
    } catch (error: any) {
      logger.error('Error exporting expenses to Excel:', error);
      throw error;
    }
  }

  /**
   * Export stock movements to Excel
   */
  async exportStockMovements(companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    productId?: number;
  }) {
    try {
      const where: any = { companyId };

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      if (filters?.productId) {
        where.productId = filters.productId;
      }

      /* TEMPORARY: StockMovement schema field mismatch - needs refactoring
      const movements = await prisma.stockMovement.findMany({
        where,
        include: {
          equipment: true // FIXED: was 'product', should be 'equipment'
        },
        orderBy: { createdAt: 'desc' } // FIXED: was 'date', doesn't exist
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stok Hareketleri');

      worksheet.columns = [
        { header: 'Tarih', key: 'date', width: 12 },
        { header: 'Ürün', key: 'product', width: 30 },
        { header: 'Hareket Tipi', key: 'type', width: 15 },
        { header: 'Miktar', key: 'quantity', width: 10 },
        { header: 'Birim Fiyat', key: 'unitPrice', width: 15 },
        { header: 'Toplam', key: 'total', width: 15 },
        { header: 'Önceki Stok', key: 'previousStock', width: 12 },
        { header: 'Yeni Stok', key: 'newStock', width: 12 },
        { header: 'Açıklama', key: 'description', width: 40 }
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2196F3' }
      };

      movements.forEach(movement => {
        worksheet.addRow({
          date: movement.createdAt, // FIXED: was date
          product: movement.equipment.name, // FIXED: was product
          type: movement.movementType, // FIXED: was type
          quantity: movement.quantity,
          unitPrice: 0, // FIXED: field doesn't exist
          total: 0, // FIXED: totalValue doesn't exist
          previousStock: movement.stockBefore, // FIXED: was previousStock
          newStock: movement.stockAfter, // FIXED: was newStock
          description: movement.notes
        });
      });

      worksheet.getColumn('date').numFmt = 'dd/mm/yyyy';
      ['unitPrice', 'total'].forEach(col => {
        worksheet.getColumn(col).numFmt = '#,##0.00';
      });
      */ // END TEMPORARY - Returns empty workbook for now
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stok Hareketleri');
      worksheet.addRow(['Stok raporu geçici olarak devre dışı']);

      logger.info(`Stock movements export temporarily disabled`);
      return workbook;
    } catch (error: any) {
      logger.error('Error exporting stock movements to Excel:', error);
      throw error;
    }
  }

  /**
   * Import customers from Excel
   */
  async importCustomers(companyId: number, buffer: Buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any); // FIXED: ExcelJS buffer type issue
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('Worksheet not found');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      const rows = worksheet.getRows(2, worksheet.rowCount - 1);
      if (!rows) {
        throw new Error('No data rows found');
      }

      for (const row of rows) {
        try {
          const [name, email, phone, address, taxNumber, taxOffice] = row.values as any[];

          if (!name) {
            continue; // Skip empty rows
          }

          await prisma.customer.create({
            data: {
              name,
              email: email || null,
              phone: phone || null,
              address: address || null,
              taxNumber: taxNumber || null,
              taxOffice: taxOffice || null,
              companyId
            }
          });

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Row ${row.number}: ${error.message}`);
        }
      }

      logger.info(`Imported customers: ${results.success} success, ${results.failed} failed`);
      return results;
    } catch (error: any) {
      logger.error('Error importing customers from Excel:', error);
      throw error;
    }
  }

  /**
   * Import equipment (products) from Excel
   */
  async importProducts(companyId: number, buffer: Buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any); // FIXED: ExcelJS buffer type issue
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('Worksheet not found');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      const rows = worksheet.getRows(2, worksheet.rowCount - 1);
      if (!rows) {
        throw new Error('No data rows found');
      }

      for (const row of rows) {
        try {
          const [name, sku, barcode, category, price, stock] = row.values as any[];

          if (!name) {
            continue;
          }

          await prisma.equipment.create({
            data: {
              name,
              serialNumber: sku || null,
              category: category || 'General',
              dailyPrice: parseFloat(price) || 0, // FIXED: was rentalPrice, changed to dailyPrice
              status: 'AVAILABLE', // FIXED: lowercase 'available' → uppercase 'AVAILABLE'
              companyId
            }
          });

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Row ${row.number}: ${error.message}`);
        }
      }

      logger.info(`Imported products: ${results.success} success, ${results.failed} failed`);
      return results;
    } catch (error: any) {
      logger.error('Error importing products from Excel:', error);
      throw error;
    }
  }

  /**
   * Generate Excel template for customers
   */
  async generateCustomerTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Müşteriler');

    worksheet.columns = [
      { header: 'Ad Soyad / Firma', key: 'name', width: 30 },
      { header: 'E-posta', key: 'email', width: 30 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Adres', key: 'address', width: 40 },
      { header: 'Vergi No', key: 'taxNumber', width: 15 },
      { header: 'Vergi Dairesi', key: 'taxOffice', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };

    // Add sample data
    worksheet.addRow({
      name: 'Örnek Müşteri',
      email: 'ornek@email.com',
      phone: '05551234567',
      address: 'Örnek Mahalle, Örnek Sokak No:1',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul Vergi Dairesi'
    });

    return workbook;
  }

  /**
   * Generate Excel template for equipment (products)
   */
  async generateProductTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ekipmanlar');

    worksheet.columns = [
      { header: 'Ekipman Adı', key: 'name', width: 30 },
      { header: 'Seri No', key: 'sku', width: 15 },
      { header: 'Barkod', key: 'barcode', width: 15 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Kiralama Fiyatı', key: 'price', width: 12 },
      { header: 'Durum', key: 'stock', width: 10 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' }
    };

    // Add sample data
    worksheet.addRow({
      name: 'Örnek Ekipman',
      sku: 'EQ-001',
      barcode: '1234567890123',
      category: 'Kamera',
      price: 500.00,
      stock: 'available'
    });

    return workbook;
  }
}

export default new ExcelService();
