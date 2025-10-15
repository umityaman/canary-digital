import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

/**
 * Base PDF Service
 * Provides common utilities for PDF generation
 */
export class PDFService {
  /**
   * Create a new PDF document with standard settings
   */
  static createDocument(options?: PDFKit.PDFDocumentOptions): PDFKit.PDFDocument {
    return new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
      ...options,
    });
  }

  /**
   * Add header to PDF
   */
  static addHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    subtitle?: string,
    logoPath?: string
  ) {
    // Logo (if provided)
    if (logoPath) {
      try {
        doc.image(logoPath, 50, 45, { width: 50 });
      } catch (error) {
        console.error('Logo could not be loaded:', error);
      }
    }

    // Company name
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('CANARY', 120, 50)
      .fontSize(10)
      .font('Helvetica')
      .text('Equipment Rental Management', 120, 75);

    // Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(title, 50, 120, { align: 'center' });

    if (subtitle) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text(subtitle, 50, 140, { align: 'center' });
    }

    // Line separator
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, 165)
      .lineTo(545, 165)
      .stroke();

    doc.fillColor('#000000'); // Reset color

    return 180; // Return Y position after header
  }

  /**
   * Add footer to PDF with page numbers
   */
  static addFooter(doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number) {
    const bottom = 50;

    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        `Sayfa ${pageNumber} / ${totalPages}`,
        50,
        doc.page.height - bottom,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc
      .fontSize(8)
      .text(
        `Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`,
        50,
        doc.page.height - bottom + 15,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc
      .fontSize(7)
      .text(
        'CANARY - Equipment Rental Management System',
        50,
        doc.page.height - bottom + 30,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  /**
   * Add table to PDF
   */
  static addTable(
    doc: PDFKit.PDFDocument,
    startY: number,
    headers: string[],
    rows: string[][],
    columnWidths?: number[]
  ): number {
    const startX = 50;
    const tableWidth = doc.page.width - 100;
    const defaultColumnWidth = tableWidth / headers.length;
    const colWidths = columnWidths || headers.map(() => defaultColumnWidth);
    let currentY = startY;

    // Header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000');

    let currentX = startX;
    headers.forEach((header, i) => {
      doc.text(header, currentX, currentY, {
        width: colWidths[i],
        align: 'left',
      });
      currentX += colWidths[i];
    });

    currentY += 20;

    // Header line
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(startX, currentY)
      .lineTo(startX + tableWidth, currentY)
      .stroke();

    currentY += 10;

    // Rows
    doc.fontSize(9).font('Helvetica');

    rows.forEach((row) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      }

      currentX = startX;
      row.forEach((cell, i) => {
        doc.text(cell, currentX, currentY, {
          width: colWidths[i],
          align: 'left',
        });
        currentX += colWidths[i];
      });

      currentY += 20;
    });

    return currentY;
  }

  /**
   * Add section title
   */
  static addSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number): number {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(title, 50, y);

    return y + 25;
  }

  /**
   * Add key-value pair
   */
  static addKeyValue(
    doc: PDFKit.PDFDocument,
    key: string,
    value: string,
    x: number,
    y: number,
    options?: { keyWidth?: number; valueColor?: string }
  ): number {
    const keyWidth = options?.keyWidth || 150;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#666666')
      .text(key + ':', x, y, { width: keyWidth, continued: false });

    doc
      .font('Helvetica')
      .fillColor(options?.valueColor || '#000000')
      .text(value, x + keyWidth, y);

    return y + 20;
  }

  /**
   * Convert PDF document to buffer
   */
  static async toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => buffers.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
      stream.on('error', reject);

      doc.pipe(stream);
      doc.end();
    });
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'TRY'): string {
    const symbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Format date
   */
  static formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format date with time
   */
  static formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
