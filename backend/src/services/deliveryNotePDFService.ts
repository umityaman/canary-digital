import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeliveryNotePDFService {
  /**
   * Generate delivery note PDF
   */
  async generatePDF(deliveryNoteId: number): Promise<Buffer> {
    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id: deliveryNoteId },
      include: {
        customer: true,
        company: true,
        order: true,
        items: {
          include: {
            equipment: true
          }
        },
        createdBy: true
      }
    });

    if (!deliveryNote) {
      throw new Error('Delivery note not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Company info
      const companyName = deliveryNote.company?.name || process.env.COMPANY_NAME || 'Canary Digital';
      const companyAddress = deliveryNote.company?.address || process.env.COMPANY_ADDRESS || '';
      const companyCity = deliveryNote.company?.city || process.env.COMPANY_CITY || '';
      const companyPhone = deliveryNote.company?.phone || process.env.COMPANY_PHONE || '';
      const companyTaxNumber = deliveryNote.company?.taxNumber || process.env.COMPANY_TAX_NUMBER || '';
      const companyTaxOffice = deliveryNote.company?.taxOffice || process.env.COMPANY_TAX_OFFICE || '';

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('İRSALİYE', { align: 'center' });
      doc.moveDown(0.5);
      
      // Delivery type badge
      const typeLabel = deliveryNote.deliveryType === 'sevk' ? 'SEVK İRSALİYESİ' : 'TAHSİLAT İRSALİYESİ';
      doc.fontSize(12).font('Helvetica').text(typeLabel, { align: 'center' });
      doc.moveDown(1);

      // Delivery number and date
      doc.fontSize(10);
      doc.text(`İrsaliye No: ${deliveryNote.deliveryNumber}`, 50, doc.y);
      doc.text(`Tarih: ${this.formatDate(deliveryNote.deliveryDate)}`, 400, doc.y - 12, { align: 'right' });
      
      if (deliveryNote.order) {
        doc.moveDown(0.3);
        doc.text(`Sipariş No: ${deliveryNote.order.orderNumber}`, 50, doc.y);
      }
      
      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Two column layout for addresses
      const leftX = 50;
      const rightX = 310;
      const startY = doc.y;

      // From address (left)
      doc.fontSize(11).font('Helvetica-Bold').text('GÖNDERİCİ:', leftX, startY);
      doc.fontSize(10).font('Helvetica');
      doc.text(companyName, leftX, doc.y + 5, { width: 240 });
      if (companyAddress) doc.text(companyAddress, leftX, doc.y + 2, { width: 240 });
      if (companyCity) doc.text(companyCity, leftX, doc.y + 2, { width: 240 });
      if (companyPhone) doc.text(`Tel: ${companyPhone}`, leftX, doc.y + 2, { width: 240 });
      if (companyTaxOffice && companyTaxNumber) {
        doc.text(`Vergi Dairesi: ${companyTaxOffice}`, leftX, doc.y + 2, { width: 240 });
        doc.text(`Vergi No: ${companyTaxNumber}`, leftX, doc.y + 2, { width: 240 });
      }

      // To address (right)
      const toStartY = startY;
      doc.fontSize(11).font('Helvetica-Bold').text('TESLİM ALAN:', rightX, toStartY);
      doc.fontSize(10).font('Helvetica');
      doc.text(deliveryNote.customer.name, rightX, toStartY + 17, { width: 240 });
      if (deliveryNote.customer.address) doc.text(deliveryNote.customer.address, rightX, doc.y + 2, { width: 240 });
      if (deliveryNote.customer.phone) doc.text(`Tel: ${deliveryNote.customer.phone}`, rightX, doc.y + 2, { width: 240 });
      if (deliveryNote.toAddress) doc.text(`Adres: ${deliveryNote.toAddress}`, rightX, doc.y + 2, { width: 240 });

      doc.moveDown(2);

      // Logistics info if available
      if (deliveryNote.driverName || deliveryNote.vehiclePlate) {
        doc.fontSize(11).font('Helvetica-Bold').text('NAKLİYE BİLGİLERİ:', 50, doc.y);
        doc.fontSize(10).font('Helvetica');
        const logisticsY = doc.y + 5;
        if (deliveryNote.driverName) doc.text(`Sürücü: ${deliveryNote.driverName}`, 50, logisticsY);
        if (deliveryNote.driverPhone) doc.text(`Tel: ${deliveryNote.driverPhone}`, 200, logisticsY);
        if (deliveryNote.vehiclePlate) doc.text(`Plaka: ${deliveryNote.vehiclePlate}`, 350, logisticsY);
        doc.moveDown(1);
      }

      // Items table
      doc.fontSize(11).font('Helvetica-Bold').text('ÜRÜN/HİZMETLER', 50, doc.y);
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('#', 50, tableTop, { width: 20 });
      doc.text('Tanım', 75, tableTop, { width: 200 });
      doc.text('Birim', 280, tableTop, { width: 40 });
      doc.text('Miktar', 325, tableTop, { width: 50, align: 'right' });
      doc.text('Birim Fiyat', 380, tableTop, { width: 70, align: 'right' });
      doc.text('KDV', 455, tableTop, { width: 40, align: 'right' });
      doc.text('Toplam', 500, tableTop, { width: 60, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();
      doc.moveDown(0.8);

      // Table rows
      doc.font('Helvetica');
      let totalAmount = 0;
      let totalVat = 0;

      deliveryNote.items.forEach((item, index) => {
        const y = doc.y;
        const lineTotal = item.quantity * item.unitPrice;
        const lineVat = lineTotal * (item.vatRate / 100);
        
        totalAmount += lineTotal;
        totalVat += lineVat;

        doc.text((index + 1).toString(), 50, y, { width: 20 });
        doc.text(
          item.equipment?.name || item.description,
          75,
          y,
          { width: 200 }
        );
        doc.text(item.unit, 280, y, { width: 40 });
        doc.text(item.quantity.toString(), 325, y, { width: 50, align: 'right' });
        doc.text(this.formatCurrency(item.unitPrice), 380, y, { width: 70, align: 'right' });
        doc.text(`${item.vatRate}%`, 455, y, { width: 40, align: 'right' });
        doc.text(this.formatCurrency(lineTotal), 500, y, { width: 60, align: 'right' });

        doc.moveDown(0.8);
      });

      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      const totalsX = 400;
      doc.fontSize(10);
      doc.text('Ara Toplam:', totalsX, doc.y);
      doc.text(this.formatCurrency(totalAmount) + ' TRY', totalsX + 100, doc.y - 12, { width: 80, align: 'right' });

      doc.moveDown(0.3);
      doc.text('KDV:', totalsX, doc.y);
      doc.text(this.formatCurrency(totalVat) + ' TRY', totalsX + 100, doc.y - 12, { width: 80, align: 'right' });

      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('GENEL TOPLAM:', totalsX, doc.y);
      doc.text(this.formatCurrency(totalAmount + totalVat) + ' TRY', totalsX + 100, doc.y - 14, { width: 80, align: 'right' });

      // Notes
      if (deliveryNote.notes) {
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('NOTLAR:', 50, doc.y);
        doc.font('Helvetica');
        doc.text(deliveryNote.notes, 50, doc.y + 5, { width: 500 });
      }

      // Signature area
      doc.moveDown(3);
      const signatureY = doc.page.height - 150;
      
      doc.fontSize(9).font('Helvetica');
      
      // Left signature (sender)
      doc.text('TESLİM EDEN', 50, signatureY);
      doc.moveTo(50, signatureY + 15).lineTo(200, signatureY + 15).stroke();
      doc.text('Ad Soyad:', 50, signatureY + 20);
      doc.text('İmza:', 50, signatureY + 35);

      // Right signature (receiver)
      doc.text('TESLİM ALAN', 370, signatureY);
      doc.moveTo(370, signatureY + 15).lineTo(520, signatureY + 15).stroke();
      doc.text('Ad Soyad:', 370, signatureY + 20);
      doc.text('İmza:', 370, signatureY + 35);

      // Footer
      doc.fontSize(8).font('Helvetica');
      doc.text(
        `İrsaliye Tarihi: ${this.formatDateTime(deliveryNote.deliveryDate)} | Durum: ${this.getStatusLabel(deliveryNote.status)}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: 500 }
      );

      doc.end();
    });
  }

  /**
   * Helper: Format date
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Helper: Format date with time
   */
  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Helper: Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Helper: Get status label
   */
  private getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Beklemede',
      'delivered': 'Teslim Edildi',
      'invoiced': 'Faturalandı',
      'cancelled': 'İptal'
    };
    return labels[status] || status;
  }
}

export default new DeliveryNotePDFService();
