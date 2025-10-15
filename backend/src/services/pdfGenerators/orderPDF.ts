import PDFDocument from 'pdfkit';
import { PDFService } from '../pdf.service';

interface OrderEquipment {
  name: string;
  quantity: number;
  dailyRate: number;
  duration: number;
  totalPrice: number;
}

interface OrderData {
  orderNumber: string;
  orderDate: Date;
  startDate: Date;
  endDate: Date;
  status: string;
  
  // Customer
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  
  // Equipment
  equipment: OrderEquipment[];
  
  // Pricing
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  paidAmount?: number;
  
  // Delivery
  deliveryAddress?: string;
  deliveryNotes?: string;
  
  // Notes
  notes?: string;
  specialInstructions?: string;
}

export class OrderPDFGenerator {
  /**
   * Generate Order Summary PDF
   */
  static async generate(data: OrderData): Promise<Buffer> {
    const doc = PDFService.createDocument();
    
    // Add header
    let currentY = PDFService.addHeader(
      doc,
      'SİPARİŞ FORMU',
      `Sipariş No: ${data.orderNumber}`
    );
    
    currentY += 20;
    
    // Order info
    currentY = this.addOrderInfo(doc, data, currentY);
    currentY += 20;
    
    // Customer info
    currentY = this.addCustomerInfo(doc, data, currentY);
    currentY += 20;
    
    // Equipment list
    currentY = this.addEquipmentTable(doc, data, currentY);
    currentY += 20;
    
    // Pricing
    currentY = this.addPricing(doc, data, currentY);
    currentY += 20;
    
    // Delivery info
    if (data.deliveryAddress || data.deliveryNotes) {
      currentY = this.addDeliveryInfo(doc, data, currentY);
      currentY += 20;
    }
    
    // Notes
    if (data.notes || data.specialInstructions) {
      this.addNotes(doc, data, currentY);
    }
    
    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      PDFService.addFooter(doc, i + 1, pages.count);
    }
    
    return PDFService.toBuffer(doc);
  }
  
  private static addOrderInfo(doc: PDFKit.PDFDocument, data: OrderData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Sipariş Bilgileri', startY);
    
    const col1X = 50;
    const col2X = 300;
    
    // Column 1
    y = PDFService.addKeyValue(doc, 'Sipariş No', data.orderNumber, col1X, y, { keyWidth: 120 });
    y = PDFService.addKeyValue(doc, 'Sipariş Tarihi', PDFService.formatDate(data.orderDate), col1X, y - 20, { keyWidth: 120 });
    y = PDFService.addKeyValue(doc, 'Durum', this.getStatusText(data.status), col1X, y, { 
      keyWidth: 120, 
      valueColor: this.getStatusColor(data.status) 
    });
    
    // Column 2
    y = startY + 25;
    y = PDFService.addKeyValue(doc, 'Başlangıç', PDFService.formatDate(data.startDate), col2X, y, { keyWidth: 100 });
    y = PDFService.addKeyValue(doc, 'Bitiş', PDFService.formatDate(data.endDate), col2X, y - 20, { keyWidth: 100 });
    
    const duration = Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24));
    y = PDFService.addKeyValue(doc, 'Süre', `${duration} Gün`, col2X, y, { keyWidth: 100 });
    
    return y + 20;
  }
  
  private static addCustomerInfo(doc: PDFKit.PDFDocument, data: OrderData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Müşteri Bilgileri', startY);
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(data.customerName, 50, y);
    
    y += 20;
    
    if (data.customerPhone) {
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`📞 ${data.customerPhone}`, 50, y);
      y += 15;
    }
    
    if (data.customerEmail) {
      doc.text(`📧 ${data.customerEmail}`, 50, y);
      y += 15;
    }
    
    if (data.customerAddress) {
      doc.text(`📍 ${data.customerAddress}`, 50, y, { width: 495 });
      y += 25;
    }
    
    doc.fillColor('#000000');
    
    return y + 10;
  }
  
  private static addEquipmentTable(doc: PDFKit.PDFDocument, data: OrderData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Ekipman Listesi', startY);
    
    const headers = ['Ekipman', 'Miktar', 'Günlük Ücret', 'Süre', 'Toplam'];
    const columnWidths = [220, 60, 90, 60, 100];
    
    const rows = data.equipment.map(item => [
      item.name,
      item.quantity.toString(),
      PDFService.formatCurrency(item.dailyRate),
      `${item.duration} gün`,
      PDFService.formatCurrency(item.totalPrice)
    ]);
    
    return PDFService.addTable(doc, y, headers, rows, columnWidths);
  }
  
  private static addPricing(doc: PDFKit.PDFDocument, data: OrderData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Fiyatlandırma', startY);
    
    const rightX = 400;
    
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
      doc.text('KDV:', rightX, y);
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
    
    // Payment status
    if (data.paidAmount !== undefined) {
      doc.fontSize(9).font('Helvetica');
      doc.text('Ödenen:', rightX, y);
      doc.text(PDFService.formatCurrency(data.paidAmount), rightX + 100, y, { align: 'right', width: 95 });
      y += 20;
      
      const remaining = data.total - data.paidAmount;
      if (remaining > 0) {
        doc.font('Helvetica-Bold').fillColor('#ef4444');
        doc.text('Kalan:', rightX, y);
        doc.text(PDFService.formatCurrency(remaining), rightX + 100, y, { align: 'right', width: 95 });
      } else {
        doc.font('Helvetica-Bold').fillColor('#10b981');
        doc.text('TAM ÖDENDİ', rightX + 100, y, { align: 'right', width: 95 });
      }
    }
    
    doc.fillColor('#000000');
    
    return y + 30;
  }
  
  private static addDeliveryInfo(doc: PDFKit.PDFDocument, data: OrderData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Teslimat Bilgileri', startY);
    
    if (data.deliveryAddress) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Teslimat Adresi:', 50, y);
      
      y += 15;
      
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#666666')
        .text(data.deliveryAddress, 50, y, { width: 495 });
      
      y += 30;
    }
    
    if (data.deliveryNotes) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Teslimat Notları:', 50, y);
      
      y += 15;
      
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#666666')
        .text(data.deliveryNotes, 50, y, { width: 495 });
      
      y += 30;
    }
    
    doc.fillColor('#000000');
    
    return y;
  }
  
  private static addNotes(doc: PDFKit.PDFDocument, data: OrderData, startY: number) {
    let y = startY;
    
    if (data.notes) {
      y = PDFService.addSectionTitle(doc, 'Notlar', y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(data.notes, 50, y, { width: 495 });
      y += 30;
    }
    
    if (data.specialInstructions) {
      y = PDFService.addSectionTitle(doc, 'Özel Talimatlar', y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(data.specialInstructions, 50, y, { width: 495 });
    }
    
    doc.fillColor('#000000');
  }
  
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      IN_PROGRESS: 'Devam Ediyor',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi'
    };
    return statusMap[status] || status;
  }
  
  private static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      IN_PROGRESS: '#8b5cf6',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444'
    };
    return colorMap[status] || '#000000';
  }
}
