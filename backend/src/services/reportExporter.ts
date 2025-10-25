import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  includeTimestamp?: boolean;
}

export class ReportExporter {
  /**
   * Export data to Excel (XLSX) format
   */
  async exportToExcel(data: any[], options: ExportOptions = {}): Promise<Buffer> {
    try {
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      const columnWidths = this.calculateColumnWidths(data);
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Add worksheet to workbook
      const sheetName = options.title || 'Report';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Set workbook properties
      workbook.Props = {
        Title: options.title || 'Report',
        Author: options.author || 'CANARY System',
        Subject: options.subject || 'Generated Report',
        CreatedDate: new Date(),
      };

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
        compression: true,
      });

      return excelBuffer as Buffer;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  /**
   * Export data to PDF format
   */
  async exportToPDF(data: any[], options: ExportOptions = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add title
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text(options.title || 'Report', { align: 'center' });
        
        doc.moveDown();

        // Add timestamp if requested
        if (options.includeTimestamp !== false) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`Generated: ${new Date().toLocaleString('tr-TR')}`, { align: 'right' });
          doc.moveDown();
        }

        // Generate table
        if (data.length > 0) {
          this.generatePDFTable(doc, data);
        } else {
          doc.fontSize(12).text('No data available', { align: 'center' });
        }

        // Add page numbers
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8)
             .text(
               `Page ${i + 1} of ${pages.count}`,
               50,
               doc.page.height - 30,
               { align: 'center' }
             );
        }

        doc.end();
      } catch (error) {
        console.error('PDF export error:', error);
        reject(new Error('Failed to export to PDF'));
      }
    });
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[]): string {
    try {
      if (data.length === 0) {
        return '';
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV header row
      const headerRow = headers.map(h => this.escapeCSVValue(h)).join(',');
      
      // Create CSV data rows
      const dataRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          return this.escapeCSVValue(value);
        }).join(',');
      });

      // Combine header and data rows
      return [headerRow, ...dataRows].join('\n');
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Failed to export to CSV');
    }
  }

  /**
   * Calculate optimal column widths for Excel
   */
  private calculateColumnWidths(data: any[]): any[] {
    if (data.length === 0) return [];

    const headers = Object.keys(data[0]);
    const widths = headers.map(header => {
      // Start with header length
      let maxLength = header.length;

      // Check data values
      for (const row of data) {
        const value = String(row[header] || '');
        maxLength = Math.max(maxLength, value.length);
      }

      // Add some padding and cap at reasonable maximum
      return { wch: Math.min(maxLength + 2, 50) };
    });

    return widths;
  }

  /**
   * Generate table in PDF document
   */
  private generatePDFTable(doc: typeof PDFDocument, data: any[]): void {
    const headers = Object.keys(data[0]);
    const tableTop = doc.y;
    const tableLeft = 50;
    const columnWidth = (doc.page.width - 100) / headers.length;
    const rowHeight = 25;

    // Draw header row
    doc.fontSize(9)
       .font('Helvetica-Bold');

    headers.forEach((header, i) => {
      const x = tableLeft + (i * columnWidth);
      
      // Draw cell border
      doc.rect(x, tableTop, columnWidth, rowHeight).stroke();
      
      // Draw header text
      doc.text(
        this.truncateText(header, columnWidth - 10),
        x + 5,
        tableTop + 7,
        {
          width: columnWidth - 10,
          align: 'left',
        }
      );
    });

    doc.moveDown();

    // Draw data rows
    doc.fontSize(8)
       .font('Helvetica');

    let currentY = tableTop + rowHeight;

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      // Check if we need a new page
      if (currentY + rowHeight > doc.page.height - 80) {
        doc.addPage();
        currentY = 50;
      }

      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.rect(tableLeft, currentY, doc.page.width - 100, rowHeight)
           .fill('#f5f5f5');
        doc.fillColor('#000000');
      }

      headers.forEach((header, i) => {
        const x = tableLeft + (i * columnWidth);
        const value = this.formatCellValue(row[header]);

        // Draw cell border
        doc.rect(x, currentY, columnWidth, rowHeight).stroke();

        // Draw cell text
        doc.text(
          this.truncateText(value, columnWidth - 10),
          x + 5,
          currentY + 7,
          {
            width: columnWidth - 10,
            align: 'left',
          }
        );
      });

      currentY += rowHeight;
    }
  }

  /**
   * Format cell value for display
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString('tr-TR');
    }

    if (typeof value === 'number') {
      return value.toLocaleString('tr-TR');
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Truncate text to fit in cell
   */
  private truncateText(text: string, maxWidth: number): string {
    const charWidth = 5; // Approximate character width
    const maxChars = Math.floor(maxWidth / charWidth);

    if (text.length <= maxChars) {
      return text;
    }

    return text.substring(0, maxChars - 3) + '...';
  }

  /**
   * Escape CSV value (handle commas, quotes, newlines)
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);

    // Check if value needs escaping
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      // Escape quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return str;
  }
}

export default new ReportExporter();
