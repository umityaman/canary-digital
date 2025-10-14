import jsPDF from 'jspdf';
import { InvoiceData, InvoiceConfig } from './InvoiceTypes';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export class ModernInvoiceTemplate {
  private doc: jsPDF;
  private data: InvoiceData;
  private config: InvoiceConfig;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor(data: InvoiceData, config: InvoiceConfig) {
    this.doc = new jsPDF('p', 'mm', 'a4');
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
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
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
    const { primaryColor } = this.config;
    
    // Header background with gradient effect
    this.doc.setFillColor(primaryColor);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Company logo (if provided)
    if (this.config.showLogo && this.data.company.logo) {
      try {
        this.doc.addImage(this.data.company.logo, 'PNG', this.margin, 15, 40, 20);
      } catch (error) {
        console.error('Logo yüklenemedi:', error);
      }
    }
    
    // FATURA text - large and bold
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATURA', this.pageWidth - this.margin, 35, { align: 'right' });
  }

  private drawInvoiceInfo(): void {
    const startY = 60;
    
    // Invoice details box
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(this.pageWidth - 70, startY, 50, 30, 3, 3, 'F');
    
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Fatura No:', this.pageWidth - 65, startY + 8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.data.invoiceNumber, this.pageWidth - 65, startY + 14);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Tarih:', this.pageWidth - 65, startY + 20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.formatDate(this.data.invoiceDate), this.pageWidth - 65, startY + 26);
  }

  private drawParties(): void {
    const startY = 100;
    const columnWidth = (this.pageWidth - 2 * this.margin - 10) / 2;
    
    // From (Company)
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, startY, columnWidth, 8, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GÖNDEREN', this.margin + 3, startY + 5.5);
    
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.data.company.name, this.margin + 3, startY + 13);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    let yPos = startY + 18;
    this.doc.text(this.data.company.address, this.margin + 3, yPos);
    yPos += 4;
    this.doc.text(`${this.data.company.postalCode} ${this.data.company.city}`, this.margin + 3, yPos);
    yPos += 4;
    this.doc.text(`Vergi No: ${this.data.company.taxNumber}`, this.margin + 3, yPos);
    yPos += 4;
    this.doc.text(`Tel: ${this.data.company.phone}`, this.margin + 3, yPos);
    yPos += 4;
    this.doc.text(this.data.company.email, this.margin + 3, yPos);
    
    // To (Customer)
    const customerX = this.margin + columnWidth + 10;
    this.doc.setFillColor(16, 185, 129);
    this.doc.rect(customerX, startY, columnWidth, 8, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ALICI', customerX + 3, startY + 5.5);
    
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.data.customer.name, customerX + 3, startY + 13);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    yPos = startY + 18;
    this.doc.text(this.data.customer.address, customerX + 3, yPos);
    yPos += 4;
    this.doc.text(`${this.data.customer.postalCode} ${this.data.customer.city}`, customerX + 3, yPos);
    if (this.data.customer.taxNumber) {
      yPos += 4;
      this.doc.text(`Vergi No: ${this.data.customer.taxNumber}`, customerX + 3, yPos);
    }
    yPos += 4;
    this.doc.text(`Tel: ${this.data.customer.phone}`, customerX + 3, yPos);
    yPos += 4;
    this.doc.text(this.data.customer.email, customerX + 3, yPos);
  }

  private drawItemsTable(): void {
    const startY = 160;
    const colWidths = [70, 20, 15, 30, 35]; // Description, Qty, Unit, Price, Total
    const rowHeight = 8;
    
    // Table header
    this.doc.setFillColor(241, 245, 249);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, rowHeight, 'F');
    
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    let xPos = this.margin + 2;
    this.doc.text('Açıklama', xPos, startY + 5.5);
    xPos += colWidths[0];
    this.doc.text('Miktar', xPos, startY + 5.5);
    xPos += colWidths[1];
    this.doc.text('Birim', xPos, startY + 5.5);
    xPos += colWidths[2];
    this.doc.text('Birim Fiyat', xPos, startY + 5.5);
    xPos += colWidths[3];
    this.doc.text('Toplam', xPos, startY + 5.5);
    
    // Table rows
    this.doc.setFont('helvetica', 'normal');
    let yPos = startY + rowHeight;
    
    this.data.items.forEach((item, index) => {
      if (index % 2 === 1) {
        this.doc.setFillColor(249, 250, 251);
        this.doc.rect(this.margin, yPos, this.pageWidth - 2 * this.margin, rowHeight, 'F');
      }
      
      xPos = this.margin + 2;
      this.doc.text(item.description, xPos, yPos + 5.5, { maxWidth: colWidths[0] - 4 });
      xPos += colWidths[0];
      this.doc.text(item.quantity.toString(), xPos, yPos + 5.5);
      xPos += colWidths[1];
      this.doc.text(item.unit, xPos, yPos + 5.5);
      xPos += colWidths[2];
      this.doc.text(this.formatCurrency(item.unitPrice), xPos, yPos + 5.5);
      xPos += colWidths[3];
      this.doc.text(this.formatCurrency(item.total), xPos, yPos + 5.5);
      
      yPos += rowHeight;
    });
    
    // Bottom border
    this.doc.setDrawColor(226, 232, 240);
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);
  }

  private drawTotals(): void {
    const startY = 160 + 8 + (this.data.items.length * 8) + 10;
    const labelX = this.pageWidth - 90;
    const valueX = this.pageWidth - 40;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 116, 139);
    
    let yPos = startY;
    
    // Subtotal
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Ara Toplam:', labelX, yPos);
    this.doc.text(this.formatCurrency(this.data.subtotal), valueX, yPos, { align: 'right' });
    yPos += 6;
    
    // Discount (if any)
    if (this.data.discount && this.data.discountAmount) {
      this.doc.text(`İndirim (${this.data.discount}%):`, labelX, yPos);
      this.doc.text(`-${this.formatCurrency(this.data.discountAmount)}`, valueX, yPos, { align: 'right' });
      yPos += 6;
    }
    
    // Tax
    if (this.config.showTax) {
      this.doc.text(`KDV (${this.data.taxRate}%):`, labelX, yPos);
      this.doc.text(this.formatCurrency(this.data.taxAmount), valueX, yPos, { align: 'right' });
      yPos += 6;
    }
    
    // Divider
    this.doc.setDrawColor(226, 232, 240);
    this.doc.line(labelX - 5, yPos, valueX + 5, yPos);
    yPos += 8;
    
    // Total
    this.doc.setFillColor(59, 130, 246);
    this.doc.roundedRect(labelX - 10, yPos - 6, 70, 12, 2, 2, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('TOPLAM:', labelX - 5, yPos + 2);
    this.doc.text(this.formatCurrency(this.data.total), valueX, yPos + 2, { align: 'right' });
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 40;
    
    // Notes
    if (this.data.notes) {
      this.doc.setFillColor(254, 252, 232);
      this.doc.roundedRect(this.margin, footerY, this.pageWidth - 2 * this.margin, 25, 2, 2, 'F');
      
      this.doc.setTextColor(133, 77, 14);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('NOTLAR:', this.margin + 3, footerY + 5);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.data.notes, this.margin + 3, footerY + 10, { 
        maxWidth: this.pageWidth - 2 * this.margin - 6 
      });
    }
    
    // Payment info
    if (this.data.bankAccount || this.data.iban) {
      let paymentY = footerY + 30;
      this.doc.setTextColor(100, 116, 139);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      
      if (this.data.iban) {
        this.doc.text(`IBAN: ${this.data.iban}`, this.margin, paymentY);
        paymentY += 4;
      }
      if (this.data.bankAccount) {
        this.doc.text(`Banka Hesabı: ${this.data.bankAccount}`, this.margin, paymentY);
      }
    }
    
    // Page number and date
    this.doc.setFontSize(8);
    this.doc.setTextColor(148, 163, 184);
    this.doc.text(
      `Oluşturulma: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }
}
