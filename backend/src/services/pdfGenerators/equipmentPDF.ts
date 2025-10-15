import PDFDocument from 'pdfkit';
import { PDFService } from '../pdf.service';

interface EquipmentItem {
  id: number;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  serialNumber?: string;
  status: string;
  dailyPrice?: number;
  location?: string;
}

interface EquipmentListData {
  title?: string;
  equipment: EquipmentItem[];
  filters?: {
    category?: string;
    status?: string;
    search?: string;
  };
  totalCount: number;
  availableCount?: number;
  rentedCount?: number;
  maintenanceCount?: number;
}

export class EquipmentPDFGenerator {
  /**
   * Generate Equipment List PDF
   */
  static async generate(data: EquipmentListData): Promise<Buffer> {
    const doc = PDFService.createDocument();
    
    // Add header
    let currentY = PDFService.addHeader(
      doc,
      data.title || 'EKIPMAN LİSTESİ',
      `Toplam: ${data.totalCount} Ekipman`
    );
    
    currentY += 20;
    
    // Summary
    if (data.availableCount !== undefined) {
      currentY = this.addSummary(doc, data, currentY);
      currentY += 20;
    }
    
    // Filters (if applied)
    if (data.filters && Object.keys(data.filters).length > 0) {
      currentY = this.addFilters(doc, data.filters, currentY);
      currentY += 20;
    }
    
    // Equipment table
    this.addEquipmentTable(doc, data.equipment, currentY);
    
    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      PDFService.addFooter(doc, i + 1, pages.count);
    }
    
    return PDFService.toBuffer(doc);
  }
  
  private static addSummary(doc: PDFKit.PDFDocument, data: EquipmentListData, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Özet', startY);
    
    const boxY = y;
    const boxHeight = 60;
    const boxWidth = 120;
    const spacing = 10;
    
    // Available
    this.addSummaryBox(doc, 50, boxY, boxWidth, boxHeight, 
      data.availableCount || 0, 'Müsait', '#10b981');
    
    // Rented
    this.addSummaryBox(doc, 50 + boxWidth + spacing, boxY, boxWidth, boxHeight,
      data.rentedCount || 0, 'Kirada', '#3b82f6');
    
    // Maintenance
    this.addSummaryBox(doc, 50 + (boxWidth + spacing) * 2, boxY, boxWidth, boxHeight,
      data.maintenanceCount || 0, 'Bakımda', '#f59e0b');
    
    // Total
    this.addSummaryBox(doc, 50 + (boxWidth + spacing) * 3, boxY, boxWidth, boxHeight,
      data.totalCount, 'Toplam', '#6b7280');
    
    return boxY + boxHeight + 20;
  }
  
  private static addSummaryBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    label: string,
    color: string
  ) {
    // Box
    doc
      .rect(x, y, width, height)
      .fillAndStroke(color, '#cccccc');
    
    // Value
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(value.toString(), x, y + 15, { width, align: 'center' });
    
    // Label
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(label, x, y + 45, { width, align: 'center' });
    
    doc.fillColor('#000000');
  }
  
  private static addFilters(doc: PDFKit.PDFDocument, filters: any, startY: number): number {
    let y = PDFService.addSectionTitle(doc, 'Uygulanan Filtreler', startY);
    
    doc.fontSize(8).font('Helvetica').fillColor('#666666');
    
    if (filters.category) {
      doc.text(`• Kategori: ${filters.category}`, 50, y);
      y += 15;
    }
    
    if (filters.status) {
      doc.text(`• Durum: ${this.getStatusText(filters.status)}`, 50, y);
      y += 15;
    }
    
    if (filters.search) {
      doc.text(`• Arama: "${filters.search}"`, 50, y);
      y += 15;
    }
    
    doc.fillColor('#000000');
    
    return y + 10;
  }
  
  private static addEquipmentTable(doc: PDFKit.PDFDocument, equipment: EquipmentItem[], startY: number) {
    let y = PDFService.addSectionTitle(doc, 'Ekipman Detayları', startY);
    
    const headers = ['Ad', 'Marka/Model', 'Seri No', 'Kategori', 'Durum', 'Fiyat'];
    const columnWidths = [130, 100, 80, 80, 70, 70];
    
    const rows = equipment.map(item => [
      item.name,
      item.brand && item.model ? `${item.brand} ${item.model}` : item.brand || item.model || '-',
      item.serialNumber || '-',
      item.category || '-',
      this.getStatusText(item.status),
      item.dailyPrice ? PDFService.formatCurrency(item.dailyPrice) + '/gün' : '-'
    ]);
    
    PDFService.addTable(doc, y, headers, rows, columnWidths);
  }
  
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      AVAILABLE: 'Müsait',
      RENTED: 'Kirada',
      RESERVED: 'Rezerve',
      MAINTENANCE: 'Bakımda',
      BROKEN: 'Arızalı',
      LOST: 'Kayıp'
    };
    return statusMap[status] || status;
  }
}
