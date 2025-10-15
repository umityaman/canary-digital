import PDFDocument from 'pdfkit';
import { PDFService } from '../pdf.service';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate?: Date;
  
  // Company info
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxNo?: string;
  
  // Customer info
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerTaxNo?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  
  // Notes
  notes?: string;
  paymentTerms?: string;
  
  // Status
  status?: string;
  paidAmount?: number;
}

export class InvoicePDFGenerator {
  /**
   * Generate Invoice PDF
   */
  static async generate(data: InvoiceData): Promise<Buffer> {
    const doc = PDFService.createDocument();
    
    // Add header
    let currentY = PDFService.addHeader(
      doc,
      'FATURA',
      `Fatura No: ${data.invoiceNumber}`
    );
    
    currentY += 20;
    
    // Invoice info and dates
    this.addInvoiceInfo(doc, data, currentY);
    currentY += 80;
    
    // Company and customer info (side by side)
    this.addPartyInfo(doc, data, currentY);
    currentY += 120;
    
    // Items table
    currentY = this.addItemsTable(doc, data, currentY);
    currentY += 20;
    
    // Totals
    currentY = this.addTotals(doc, data, currentY);
    currentY += 20;
    
    // Notes and payment terms
    if (data.notes || data.paymentTerms) {
      this.addNotesAndTerms(doc, data, currentY);
    }
    
    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      PDFService.addFooter(doc, i + 1, pages.count);
    }
    
    return PDFService.toBuffer(doc);
  }
  
  private static addInvoiceInfo(doc: PDFKit.PDFDocument, data: InvoiceData, startY: number) {
    const leftX = 50;
    const rightX = 350;
    
    // Left side - Invoice details
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Fatura Bilgileri', leftX, startY);
    
    let y = startY + 20;
    PDFService.addKeyValue(doc, 'Fatura No', data.invoiceNumber, leftX, y, { keyWidth: 100 });
    y += 20;
    PDFService.addKeyValue(doc, 'Tarih', PDFService.formatDate(data.date), leftX, y, { keyWidth: 100 });
    
    if (data.dueDate) {
      y += 20;
      PDFService.addKeyValue(doc, 'Vade Tarihi', PDFService.formatDate(data.dueDate), leftX, y, { keyWidth: 100 });
    }
    
    // Right side - Status
    if (data.status) {
      const statusY = startY + 20;
      const statusColor = data.status === 'PAID' ? '#10b981' : data.status === 'OVERDUE' ? '#ef4444' : '#f59e0b';
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(this.getStatusText(data.status), rightX, statusY, { align: 'right' });
    }
  }
  
  private static addPartyInfo(doc: PDFKit.PDFDocument, data: InvoiceData, startY: number) {
    const leftX = 50;
    const rightX = 320;
    
    // From (Company)
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Gönderen:', leftX, startY);
    
    let y = startY + 20;
    doc.fontSize(9).font('Helvetica-Bold').text(data.companyName, leftX, y);
    y += 15;
    
    if (data.companyAddress) {
      doc.font('Helvetica').fontSize(8).fillColor('#666666').text(data.companyAddress, leftX, y, { width: 220 });
      y += 25;
    }
    
    if (data.companyPhone) {
      doc.text(`Tel: ${data.companyPhone}`, leftX, y);
      y += 12;
    }
    
    if (data.companyEmail) {
      doc.text(`Email: ${data.companyEmail}`, leftX, y);
      y += 12;
    }
    
    if (data.companyTaxNo) {
      doc.text(`Vergi No: ${data.companyTaxNo}`, leftX, y);
    }
    
    // To (Customer)
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Alıcı:', rightX, startY);
    
    y = startY + 20;
    doc.fontSize(9).font('Helvetica-Bold').text(data.customerName, rightX, y);
    y += 15;
    
    if (data.customerAddress) {
      doc.font('Helvetica').fontSize(8).fillColor('#666666').text(data.customerAddress, rightX, y, { width: 220 });
      y += 25;
    }
    
    if (data.customerPhone) {
      doc.text(`Tel: ${data.customerPhone}`, rightX, y);
      y += 12;
    }
    
    if (data.customerEmail) {
      doc.text(`Email: ${data.customerEmail}`, rightX, y);
      y += 12;
    }
    
    if (data.customerTaxNo) {
      doc.text(`Vergi No: ${data.customerTaxNo}`, rightX, y);
    }
    
    doc.fillColor('#000000');
  }
  
  private static addItemsTable(doc: PDFKit.PDFDocument, data: InvoiceData, startY: number): number {
    const headers = ['Açıklama', 'Miktar', 'Birim Fiyat', 'Toplam'];
    const columnWidths = [250, 80, 100, 100];
    
    const rows = data.items.map(item => [
      item.description,
      item.quantity.toString(),
      PDFService.formatCurrency(item.unitPrice),
      PDFService.formatCurrency(item.totalPrice)
    ]);
    
    return PDFService.addTable(doc, startY, headers, rows, columnWidths);
  }
  
  private static addTotals(doc: PDFKit.PDFDocument, data: InvoiceData, startY: number): number {
    const rightX = 400;
    let y = startY;
    
    // Subtotal
    doc.fontSize(9).font('Helvetica');
    doc.text('Ara Toplam:', rightX, y);
    doc.text(PDFService.formatCurrency(data.subtotal), rightX + 100, y, { align: 'right', width: 95 });
    y += 20;
    
    // Discount
    if (data.discountAmount && data.discountAmount > 0) {
      doc.text('İndirim:', rightX, y);
      doc.fillColor('#ef4444').text(`-${PDFService.formatCurrency(data.discountAmount)}`, rightX + 100, y, { align: 'right', width: 95 });
      doc.fillColor('#000000');
      y += 20;
    }
    
    // Tax
    if (data.taxAmount && data.taxAmount > 0) {
      const taxLabel = data.taxRate ? `KDV (%${data.taxRate})` : 'KDV';
      doc.text(taxLabel, rightX, y);
      doc.text(PDFService.formatCurrency(data.taxAmount), rightX + 100, y, { align: 'right', width: 95 });
      y += 20;
    }
    
    // Line
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(rightX, y)
      .lineTo(545, y)
      .stroke();
    
    y += 15;
    
    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOPLAM:', rightX, y);
    doc
      .fillColor('#10b981')
      .text(PDFService.formatCurrency(data.total), rightX + 100, y, { align: 'right', width: 95 });
    
    doc.fillColor('#000000');
    y += 30;
    
    // Paid amount
    if (data.paidAmount && data.paidAmount > 0) {
      doc.fontSize(9).font('Helvetica');
      doc.text('Ödenen:', rightX, y);
      doc.text(PDFService.formatCurrency(data.paidAmount), rightX + 100, y, { align: 'right', width: 95 });
      y += 20;
      
      const remaining = data.total - data.paidAmount;
      if (remaining > 0) {
        doc.font('Helvetica-Bold').fillColor('#ef4444');
        doc.text('Kalan:', rightX, y);
        doc.text(PDFService.formatCurrency(remaining), rightX + 100, y, { align: 'right', width: 95 });
      }
    }
    
    return y + 40;
  }
  
  private static addNotesAndTerms(doc: PDFKit.PDFDocument, data: InvoiceData, startY: number) {
    let y = startY;
    
    if (data.notes) {
      y = PDFService.addSectionTitle(doc, 'Notlar', y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(data.notes, 50, y, { width: 495, align: 'left' });
      y += 40;
    }
    
    if (data.paymentTerms) {
      y = PDFService.addSectionTitle(doc, 'Ödeme Koşulları', y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(data.paymentTerms, 50, y, { width: 495, align: 'left' });
    }
    
    doc.fillColor('#000000');
  }
  
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PAID: 'ÖDENDİ',
      PENDING: 'BEKLEMEDE',
      OVERDUE: 'VADESİ GEÇTİ',
      CANCELLED: 'İPTAL',
      PARTIAL: 'KISMİ ÖDEME'
    };
    return statusMap[status] || status;
  }
}
