import type jsPDF from 'jspdf';
import { InvoiceData, InvoiceConfig } from './InvoiceTypes';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export class ClassicInvoiceTemplate {
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
    this.margin = 25;
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
    this.drawBorder();
    this.drawHeader();
    this.drawTitle();
    this.drawInvoiceInfo();
    this.drawParties();
    this.drawItemsTable();
    this.drawTotals();
    this.drawFooter();
    return this.doc;
  }

  private drawBorder(): void {
    // Classic double border
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);
    this.doc.setLineWidth(0.3);
    this.doc.rect(12, 12, this.pageWidth - 24, this.pageHeight - 24);
  }

  private drawHeader(): void {
    const startY = 20;
    
    // Company logo (centered if provided)
    if (this.config.showLogo && this.data.company.logo) {
      try {
        this.doc.addImage(
          this.data.company.logo,
          'PNG',
          this.pageWidth / 2 - 20,
          startY,
          40,
          20
        );
      } catch (error) {
        console.error('Logo yüklenemedi:', error);
      }
    }
    
    // Company name - centered and large
    this.doc.setFontSize(18);
    this.doc.setFont('times', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(
      this.data.company.name,
      this.pageWidth / 2,
      startY + 30,
      { align: 'center' }
    );
    
    // Company details - centered
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');
    let yPos = startY + 37;
    this.doc.text(this.data.company.address, this.pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    this.doc.text(
      `${this.data.company.postalCode} ${this.data.company.city}`,
      this.pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 5;
    this.doc.text(
      `Tel: ${this.data.company.phone} | Email: ${this.data.company.email}`,
      this.pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 5;
    this.doc.text(
      `Vergi No: ${this.data.company.taxNumber}`,
      this.pageWidth / 2,
      yPos,
      { align: 'center' }
    );
  }

  private drawTitle(): void {
    // Decorative line
    const lineY = 75;
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.margin, lineY, this.pageWidth - this.margin, lineY);
    
    // FATURA title
    this.doc.setFontSize(24);
    this.doc.setFont('times', 'bold');
    this.doc.text('FATURA', this.pageWidth / 2, lineY + 10, { align: 'center' });
    
    // Decorative line
    this.doc.line(this.margin, lineY + 14, this.pageWidth - this.margin, lineY + 14);
  }

  private drawInvoiceInfo(): void {
    const startY = 95;
    
    this.doc.setFontSize(11);
    this.doc.setFont('times', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Left side
    this.doc.text('Fatura No:', this.margin, startY);
    this.doc.text('Fatura Tarihi:', this.margin, startY + 7);
    this.doc.text('Vade Tarihi:', this.margin, startY + 14);
    
    // Right side - values
    this.doc.setFont('times', 'normal');
    this.doc.text(this.data.invoiceNumber, this.margin + 35, startY);
    this.doc.text(this.formatDate(this.data.invoiceDate), this.margin + 35, startY + 7);
    this.doc.text(this.formatDate(this.data.dueDate), this.margin + 35, startY + 14);
  }

  private drawParties(): void {
    const startY = 120;
    const columnWidth = (this.pageWidth - 2 * this.margin - 10) / 2;
    
    // Draw boxes
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.rect(this.margin, startY, columnWidth, 40);
    this.doc.rect(this.margin + columnWidth + 10, startY, columnWidth, 40);
    
    // From (Company)
    this.doc.setFontSize(11);
    this.doc.setFont('times', 'bold');
    this.doc.text('Gönderen:', this.margin + 3, startY + 7);
    
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');
    let yPos = startY + 13;
    this.doc.text(this.data.company.name, this.margin + 3, yPos);
    yPos += 5;
    this.doc.text(this.data.company.address, this.margin + 3, yPos);
    yPos += 5;
    this.doc.text(
      `${this.data.company.postalCode} ${this.data.company.city}`,
      this.margin + 3,
      yPos
    );
    yPos += 5;
    this.doc.text(`Vergi No: ${this.data.company.taxNumber}`, this.margin + 3, yPos);
    
    // To (Customer)
    const customerX = this.margin + columnWidth + 10;
    this.doc.setFontSize(11);
    this.doc.setFont('times', 'bold');
    this.doc.text('Alıcı:', customerX + 3, startY + 7);
    
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');
    yPos = startY + 13;
    this.doc.text(this.data.customer.name, customerX + 3, yPos);
    yPos += 5;
    this.doc.text(this.data.customer.address, customerX + 3, yPos);
    yPos += 5;
    this.doc.text(
      `${this.data.customer.postalCode} ${this.data.customer.city}`,
      customerX + 3,
      yPos
    );
    if (this.data.customer.taxNumber) {
      yPos += 5;
      this.doc.text(`Vergi No: ${this.data.customer.taxNumber}`, customerX + 3, yPos);
    }
  }

  private drawItemsTable(): void {
    const startY = 170;
    const colWidths = [10, 65, 20, 20, 25, 30]; // #, Description, Qty, Unit, Price, Total
    const rowHeight = 9;
    
    // Table header
    this.doc.setFillColor(230, 230, 230);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, rowHeight, 'FD');
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'bold');
    
    let xPos = this.margin + 2;
    this.doc.text('#', xPos, startY + 6);
    xPos += colWidths[0];
    this.doc.text('Açıklama', xPos, startY + 6);
    xPos += colWidths[1];
    this.doc.text('Miktar', xPos, startY + 6);
    xPos += colWidths[2];
    this.doc.text('Birim', xPos, startY + 6);
    xPos += colWidths[3];
    this.doc.text('Birim Fiyat', xPos, startY + 6);
    xPos += colWidths[4];
    this.doc.text('Toplam', xPos, startY + 6);
    
    // Table rows
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(9);
    let yPos = startY + rowHeight;
    
    this.data.items.forEach((item, index) => {
      // Alternating rows
      if (index % 2 === 1) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.margin, yPos, this.pageWidth - 2 * this.margin, rowHeight, 'F');
      }
      
      // Row border
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, yPos + rowHeight, this.pageWidth - this.margin, yPos + rowHeight);
      
      xPos = this.margin + 2;
      this.doc.text((index + 1).toString(), xPos, yPos + 6);
      xPos += colWidths[0];
      this.doc.text(item.description, xPos, yPos + 6, { maxWidth: colWidths[1] - 4 });
      xPos += colWidths[1];
      this.doc.text(item.quantity.toString(), xPos, yPos + 6);
      xPos += colWidths[2];
      this.doc.text(item.unit, xPos, yPos + 6);
      xPos += colWidths[3];
      this.doc.text(this.formatCurrency(item.unitPrice), xPos, yPos + 6);
      xPos += colWidths[4];
      this.doc.text(this.formatCurrency(item.total), xPos, yPos + 6);
      
      yPos += rowHeight;
    });
    
    // Bottom border
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);
  }

  private drawTotals(): void {
    const startY = 170 + 9 + (this.data.items.length * 9) + 10;
    const labelX = this.pageWidth - 80;
    const valueX = this.pageWidth - 30;
    
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    let yPos = startY;
    
    // Subtotal
    this.doc.text('Ara Toplam:', labelX, yPos);
    this.doc.text(this.formatCurrency(this.data.subtotal), valueX, yPos, { align: 'right' });
    yPos += 6;
    
    // Discount
    if (this.data.discount && this.data.discountAmount) {
      this.doc.text(`İndirim (${this.data.discount}%):`, labelX, yPos);
      this.doc.text(`-${this.formatCurrency(this.data.discountAmount)}`, valueX, yPos, {
        align: 'right',
      });
      yPos += 6;
    }
    
    // Tax
    if (this.config.showTax) {
      this.doc.text(`KDV (${this.data.taxRate}%):`, labelX, yPos);
      this.doc.text(this.formatCurrency(this.data.taxAmount), valueX, yPos, { align: 'right' });
      yPos += 6;
    }
    
    // Divider
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(labelX - 5, yPos - 1, valueX + 5, yPos - 1);
    yPos += 5;
    
    // Total
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('TOPLAM:', labelX, yPos);
    this.doc.text(this.formatCurrency(this.data.total), valueX, yPos, { align: 'right' });
    
    // Box around total
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(labelX - 8, yPos - 8, 65, 12);
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 60;
    
    // Notes
    if (this.data.notes) {
      this.doc.setFontSize(9);
      this.doc.setFont('times', 'bold');
      this.doc.text('NOTLAR:', this.margin, footerY);
      
      this.doc.setFont('times', 'italic');
      this.doc.setFontSize(8);
      const splitNotes = this.doc.splitTextToSize(
        this.data.notes,
        this.pageWidth - 2 * this.margin
      );
      this.doc.text(splitNotes, this.margin, footerY + 5);
    }
    
    // Terms
    if (this.data.terms) {
      this.doc.setFontSize(9);
      this.doc.setFont('times', 'bold');
      this.doc.text('ŞARTLAR VE KOŞULLAR:', this.margin, footerY + 20);
      
      this.doc.setFont('times', 'normal');
      this.doc.setFontSize(7);
      const splitTerms = this.doc.splitTextToSize(
        this.data.terms,
        this.pageWidth - 2 * this.margin
      );
      this.doc.text(splitTerms, this.margin, footerY + 25);
    }
    
    // Signature line
    const sigY = this.pageHeight - 35;
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(this.pageWidth - 70, sigY, this.pageWidth - this.margin, sigY);
    this.doc.setFontSize(8);
    this.doc.setFont('times', 'italic');
    this.doc.text('Yetkili İmza', this.pageWidth - 50, sigY + 5, { align: 'center' });
    
    // Footer text
    this.doc.setFontSize(7);
    this.doc.setFont('times', 'normal');
    this.doc.text(
      `Bu fatura ${format(new Date(), 'dd/MM/yyyy HH:mm')} tarihinde elektronik olarak oluşturulmuştur.`,
      this.pageWidth / 2,
      this.pageHeight - 18,
      { align: 'center' }
    );
  }
}
