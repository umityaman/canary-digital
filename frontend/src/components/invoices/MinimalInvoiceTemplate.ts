import type jsPDF from 'jspdf';
import { InvoiceData, InvoiceConfig } from './InvoiceTypes';
import { format } from 'date-fns';

export class MinimalInvoiceTemplate {
  private doc: jsPDF;
  private data: InvoiceData;
  private config: InvoiceConfig;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor(doc: jsPDF, data: InvoiceData, config: InvoiceConfig) {
    this.doc = doc;
    this.data = data;
    this.config = config;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.config.locale, {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy');
  }

  public generate(): jsPDF {
    this.drawHeader();
    this.drawInvoiceInfo();
    this.drawParties();
    this.drawItemsTable();
    this.drawTotals();
    this.drawFooter();
    return this.doc;
  }

  private drawHeader(): void {
    // Company name - large and simple
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.data.company.name, this.margin, 25);
    
    // Thin line under company name
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 30, this.pageWidth - this.margin, 30);
    
    // INVOICE text - top right
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(220, 220, 220);
    this.doc.text('INVOICE', this.pageWidth - this.margin, 25, { align: 'right' });
  }

  private drawInvoiceInfo(): void {
    const startY = 45;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    // Left side - company details
    let yPos = startY;
    this.doc.text(this.data.company.address, this.margin, yPos);
    yPos += 4;
    this.doc.text(`${this.data.company.city}, ${this.data.company.postalCode}`, this.margin, yPos);
    yPos += 4;
    this.doc.text(this.data.company.email, this.margin, yPos);
    yPos += 4;
    this.doc.text(this.data.company.phone, this.margin, yPos);
    
    // Right side - invoice details
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    
    yPos = startY;
    const rightX = this.pageWidth - this.margin;
    
    this.doc.text('Fatura No', rightX - 40, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.data.invoiceNumber, rightX, yPos, { align: 'right' });
    
    yPos += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Tarih', rightX - 40, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(this.data.invoiceDate), rightX, yPos, { align: 'right' });
    
    yPos += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Vade', rightX - 40, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(this.data.dueDate), rightX, yPos, { align: 'right' });
  }

  private drawParties(): void {
    const startY = 80;
    
    // Bill To section
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('FATURA EDİLEN', this.margin, startY);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    let yPos = startY + 7;
    this.doc.text(this.data.customer.name, this.margin, yPos);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(9);
    yPos += 5;
    this.doc.text(this.data.customer.address, this.margin, yPos);
    yPos += 4;
    this.doc.text(`${this.data.customer.city}, ${this.data.customer.postalCode}`, this.margin, yPos);
    yPos += 4;
    this.doc.text(this.data.customer.email, this.margin, yPos);
    yPos += 4;
    this.doc.text(this.data.customer.phone, this.margin, yPos);
    
    if (this.data.customer.taxNumber) {
      yPos += 4;
      this.doc.text(`Vergi No: ${this.data.customer.taxNumber}`, this.margin, yPos);
    }
  }

  private drawItemsTable(): void {
    const startY = 130;
    const colWidths = [80, 25, 20, 30, 30]; // Description, Qty, Unit, Price, Total
    const rowHeight = 10;
    
    // Table header
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    let xPos = this.margin;
    let yPos = startY;
    
    this.doc.text('HİZMET / ÜRÜN', xPos, yPos);
    xPos += colWidths[0];
    this.doc.text('MİKTAR', xPos, yPos);
    xPos += colWidths[1];
    this.doc.text('BİRİM', xPos, yPos);
    xPos += colWidths[2];
    this.doc.text('FİYAT', xPos, yPos);
    xPos += colWidths[3];
    this.doc.text('TOPLAM', xPos, yPos);
    
    // Line under header
    yPos += 2;
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);
    
    // Table rows
    yPos += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    this.data.items.forEach((item) => {
      xPos = this.margin;
      
      this.doc.text(item.description, xPos, yPos, { maxWidth: colWidths[0] - 5 });
      xPos += colWidths[0];
      this.doc.text(item.quantity.toString(), xPos, yPos);
      xPos += colWidths[1];
      this.doc.text(item.unit, xPos, yPos);
      xPos += colWidths[2];
      this.doc.text(this.formatCurrency(item.unitPrice), xPos, yPos);
      xPos += colWidths[3];
      this.doc.text(this.formatCurrency(item.total), xPos, yPos);
      
      yPos += rowHeight;
      
      // Subtle line between items
      this.doc.setDrawColor(240, 240, 240);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margin, yPos - 2, this.pageWidth - this.margin, yPos - 2);
    });
  }

  private drawTotals(): void {
    const startY = 130 + 10 + (this.data.items.length * 10) + 10;
    const labelX = this.pageWidth - 80;
    const valueX = this.pageWidth - this.margin;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    
    let yPos = startY;
    
    // Subtotal
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Ara Toplam', labelX, yPos);
    this.doc.text(this.formatCurrency(this.data.subtotal), valueX, yPos, { align: 'right' });
    yPos += 6;
    
    // Discount
    if (this.data.discount && this.data.discountAmount) {
      this.doc.text(`İndirim (${this.data.discount}%)`, labelX, yPos);
      this.doc.text(`-${this.formatCurrency(this.data.discountAmount)}`, valueX, yPos, {
        align: 'right',
      });
      yPos += 6;
    }
    
    // Tax
    if (this.config.showTax) {
      this.doc.text(`KDV (${this.data.taxRate}%)`, labelX, yPos);
      this.doc.text(this.formatCurrency(this.data.taxAmount), valueX, yPos, { align: 'right' });
      yPos += 8;
    } else {
      yPos += 2;
    }
    
    // Line above total
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(labelX - 5, yPos - 2, valueX, yPos - 2);
    yPos += 5;
    
    // Total
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text('TOPLAM', labelX, yPos);
    this.doc.text(this.formatCurrency(this.data.total), valueX, yPos, { align: 'right' });
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 50;
    
    // Payment info
    if (this.data.iban || this.data.bankAccount) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('ÖDEME BİLGİLERİ', this.margin, footerY);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(80, 80, 80);
      let yPos = footerY + 5;
      
      if (this.data.iban) {
        this.doc.text(`IBAN: ${this.data.iban}`, this.margin, yPos);
        yPos += 4;
      }
      if (this.data.bankAccount) {
        this.doc.text(`Hesap: ${this.data.bankAccount}`, this.margin, yPos);
      }
    }
    
    // Notes
    if (this.data.notes) {
      let notesY = footerY + 20;
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(120, 120, 120);
      const splitNotes = this.doc.splitTextToSize(this.data.notes, this.pageWidth - 2 * this.margin);
      this.doc.text(splitNotes, this.margin, notesY);
    }
    
    // Bottom line
    const lineY = this.pageHeight - 20;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, lineY, this.pageWidth - this.margin, lineY);
    
    // Thank you message
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      'İşbirliğiniz için teşekkür ederiz',
      this.pageWidth / 2,
      lineY + 5,
      { align: 'center' }
    );
    
    // Generation date
    this.doc.setFontSize(7);
    this.doc.text(
      `Oluşturulma: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }
}
