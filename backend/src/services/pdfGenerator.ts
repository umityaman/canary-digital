import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface InspectionData {
  id: number;
  inspectionType: string;
  status: string;
  overallCondition?: string;
  checklistData?: string;
  notes?: string;
  location?: string;
  inspectionDate: Date | string;
  createdAt: Date | string;
  customerSignature?: string;
  inspectorSignature?: string;
  equipment?: {
    name: string;
    serialNumber?: string;
    status?: string;
  };
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  inspector?: {
    name: string;
    email?: string;
  };
  order?: {
    orderNumber?: string;
  };
  photos?: Array<{
    photoUrl: string;
    caption?: string;
    photoType: string;
  }>;
  damageReports?: Array<{
    damageType: string;
    severity: string;
    description: string;
    location?: string;
    estimatedCost?: number;
    actualCost?: number;
    responsibleParty?: string;
  }>;
}

export class InspectionPDFGenerator {
  private doc: PDFKit.PDFDocument;
  private y: number = 50; // Current Y position

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });
  }

  async generate(inspection: InspectionData): Promise<NodeJS.ReadableStream> {
    // Header
    this.addHeader(inspection);
    
    // Status and Type
    this.addStatusSection(inspection);
    
    // Main Information
    this.addMainInfo(inspection);
    
    // Checklist
    if (inspection.checklistData) {
      this.addChecklist(inspection);
    }
    
    // Photos
    if (inspection.photos && inspection.photos.length > 0) {
      this.addPhotos(inspection);
    }
    
    // Damage Reports
    if (inspection.damageReports && inspection.damageReports.length > 0) {
      this.addDamageReports(inspection);
    }
    
    // Notes
    if (inspection.notes) {
      this.addNotes(inspection);
    }
    
    // Signatures
    this.addSignatures(inspection);
    
    // Footer
    this.addFooter();
    
    // Finalize PDF
    this.doc.end();
    
    return this.doc;
  }

  private addHeader(inspection: InspectionData) {
    // Company Logo Area (placeholder)
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('CANARY', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .text('Kamera Kiralama Sistemi', 50, 80);
    
    // Title
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Kalite Kontrol Raporu', 50, 120, { align: 'center' });
    
    // Report Number and Date
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Rapor No: #${inspection.id}`, 50, 150, { align: 'center' })
      .text(
        `Tarih: ${new Date(inspection.createdAt).toLocaleDateString('tr-TR')}`,
        50,
        170,
        { align: 'center' }
      );
    
    this.y = 210;
    this.addHorizontalLine();
  }

  private addStatusSection(inspection: InspectionData) {
    this.y += 20;
    
    const statusLabels: Record<string, string> = {
      PENDING: 'Beklemede',
      APPROVED: 'Onaylandı',
      REJECTED: 'Reddedildi',
      DAMAGE_FOUND: 'Hasar Bulundu',
    };
    
    const typeLabels: Record<string, string> = {
      CHECKOUT: 'Teslim Alış',
      CHECKIN: 'Teslim Ediş',
    };
    
    const conditionLabels: Record<string, string> = {
      EXCELLENT: 'Mükemmel',
      GOOD: 'İyi',
      FAIR: 'Orta',
      POOR: 'Kötü',
    };
    
    this.doc.fontSize(12).font('Helvetica-Bold');
    
    // Status
    this.doc.text('Durum:', 50, this.y);
    this.doc
      .font('Helvetica')
      .text(statusLabels[inspection.status] || inspection.status, 150, this.y);
    
    // Type
    this.y += 20;
    this.doc.font('Helvetica-Bold').text('Kontrol Tipi:', 50, this.y);
    this.doc
      .font('Helvetica')
      .text(typeLabels[inspection.inspectionType] || inspection.inspectionType, 150, this.y);
    
    // Overall Condition
    if (inspection.overallCondition) {
      this.y += 20;
      this.doc.font('Helvetica-Bold').text('Genel Durum:', 50, this.y);
      this.doc
        .font('Helvetica')
        .text(
          conditionLabels[inspection.overallCondition] || inspection.overallCondition,
          150,
          this.y
        );
    }
    
    this.y += 30;
    this.addHorizontalLine();
  }

  private addMainInfo(inspection: InspectionData) {
    this.y += 20;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Detay Bilgiler', 50, this.y);
    
    this.y += 25;
    
    // Equipment Info
    if (inspection.equipment) {
      this.addInfoBox('Ekipman Bilgileri', [
        ['Ekipman:', inspection.equipment.name],
        ['Seri No:', inspection.equipment.serialNumber || '-'],
        ['Durum:', inspection.equipment.status || '-'],
      ]);
    }
    
    // Customer Info
    if (inspection.customer) {
      this.addInfoBox('Müşteri Bilgileri', [
        ['Müşteri:', inspection.customer.name],
        ['Telefon:', inspection.customer.phone || '-'],
        ['E-posta:', inspection.customer.email || '-'],
      ]);
    }
    
    // Inspector Info
    if (inspection.inspector) {
      this.addInfoBox('Kontrol Eden', [
        ['Personel:', inspection.inspector.name],
        ['E-posta:', inspection.inspector.email || '-'],
      ]);
    }
    
    // Location and Date
    this.addInfoBox('Konum & Tarih', [
      ['Konum:', inspection.location || 'Belirtilmemiş'],
      [
        'Kontrol Tarihi:',
        new Date(inspection.inspectionDate).toLocaleDateString('tr-TR'),
      ],
    ]);
    
    this.y += 10;
  }

  private addInfoBox(title: string, items: string[][]) {
    // Box background
    this.doc
      .rect(50, this.y - 5, 495, 15 + items.length * 20)
      .fillAndStroke('#F5F5F5', '#E0E0E0');
    
    // Title
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(title, 55, this.y);
    
    this.y += 20;
    
    // Items
    items.forEach(([label, value]) => {
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#666666')
        .text(label, 55, this.y)
        .font('Helvetica')
        .fillColor('#000000')
        .text(value, 180, this.y);
      
      this.y += 20;
    });
    
    this.y += 5;
  }

  private addChecklist(inspection: InspectionData) {
    // Check if we need a new page
    if (this.y > 650) {
      this.doc.addPage();
      this.y = 50;
    }
    
    this.y += 20;
    
    // Parse checklist
    let checklist: any[] = [];
    try {
      checklist = JSON.parse(inspection.checklistData || '[]');
    } catch (e) {
      checklist = [];
    }
    
    if (checklist.length === 0) return;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Kontrol Listesi', 50, this.y);
    
    const completedCount = checklist.filter((item: any) => item.checked).length;
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${completedCount} / ${checklist.length} tamamlandı`, 450, this.y);
    
    this.y += 25;
    
    // Group by category
    const categories: Record<string, any[]> = {};
    checklist.forEach((item: any) => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    // Render each category
    Object.entries(categories).forEach(([category, items]) => {
      // Check if we need a new page
      if (this.y > 700) {
        this.doc.addPage();
        this.y = 50;
      }
      
      // Category header
      this.doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(category, 50, this.y);
      
      this.y += 18;
      
      // Items
      items.forEach((item: any) => {
        if (this.y > 730) {
          this.doc.addPage();
          this.y = 50;
        }
        
        // Checkbox
        const checkboxX = 55;
        const checkboxY = this.y;
        
        this.doc.rect(checkboxX, checkboxY, 12, 12).stroke('#666666');
        
        if (item.checked) {
          this.doc
            .fontSize(10)
            .fillColor('#22C55E')
            .text('✓', checkboxX + 2, checkboxY);
        }
        
        // Item text
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(item.checked ? '#666666' : '#000000')
          .text(item.label, checkboxX + 20, checkboxY, {
            width: 470,
          });
        
        this.y += 18;
        
        // Notes
        if (item.notes) {
          this.doc
            .fontSize(9)
            .fillColor('#999999')
            .text(`📝 ${item.notes}`, checkboxX + 20, this.y, {
              width: 470,
            });
          this.y += 15;
        }
      });
      
      this.y += 10;
    });
  }

  private addDamageReports(inspection: InspectionData) {
    if (!inspection.damageReports || inspection.damageReports.length === 0) return;
    
    // New page for damage reports
    this.doc.addPage();
    this.y = 50;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#DC2626')
      .text('⚠ Hasar Raporları', 50, this.y);
    
    this.y += 25;
    
    inspection.damageReports.forEach((damage, index) => {
      if (this.y > 650) {
        this.doc.addPage();
        this.y = 50;
      }
      
      // Damage box background
      this.doc
        .rect(50, this.y - 5, 495, 110)
        .fillAndStroke('#FEE2E2', '#DC2626');
      
      // Damage number and type
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#7F1D1D')
        .text(`Hasar #${index + 1}: ${damage.damageType}`, 55, this.y);
      
      // Severity
      const severityLabels: Record<string, string> = {
        MINOR: 'Hafif',
        MODERATE: 'Orta',
        MAJOR: 'Ciddi',
        CRITICAL: 'Kritik',
      };
      
      const severityColors: Record<string, string> = {
        MINOR: '#F59E0B',      // Yellow/Orange
        MODERATE: '#F97316',   // Orange
        MAJOR: '#EF4444',      // Red
        CRITICAL: '#991B1B',   // Dark Red
      };
      
      const severityColor = severityColors[damage.severity] || '#DC2626';
      
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(severityColor)
        .text(
          `⚠ ${severityLabels[damage.severity] || damage.severity}`,
          450,
          this.y
        );
      
      this.y += 20;
      
      // Description
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .text(damage.description, 55, this.y, {
          width: 485,
        });
      
      this.y += 35;
      
      // Additional info
      const infoItems: string[] = [];
      
      if (damage.location) {
        infoItems.push(`📍 Konum: ${damage.location}`);
      }
      
      if (damage.estimatedCost) {
        infoItems.push(`💰 Tahmini Maliyet: ₺${damage.estimatedCost}`);
      }
      
      if (damage.responsibleParty) {
        infoItems.push(`👤 Sorumlu: ${damage.responsibleParty}`);
      }
      
      this.doc
        .fontSize(9)
        .fillColor('#666666')
        .text(infoItems.join('  |  '), 55, this.y);
      
      this.y += 30;
    });
  }

  private addNotes(inspection: InspectionData) {
    if (!inspection.notes) return;
    
    // Check if we need a new page
    if (this.y > 650) {
      this.doc.addPage();
      this.y = 50;
    }
    
    this.y += 20;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Notlar', 50, this.y);
    
    this.y += 20;
    
    // Notes box
    this.doc
      .rect(50, this.y - 5, 495, 60)
      .fillAndStroke('#EFF6FF', '#3B82F6');
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(inspection.notes, 55, this.y, {
        width: 485,
      });
    
    this.y += 70;
  }

  private addPhotos(inspection: InspectionData) {
    // New page for photos
    this.doc.addPage();
    this.y = 50;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Fotoğraflar', 50, this.y);
    
    this.y += 30;
    
    const photos = inspection.photos || [];
    const photosPerRow = 2;
    const photoWidth = 220;
    const photoHeight = 165;
    const gap = 25;
    
    photos.forEach((photo, index) => {
      const col = index % photosPerRow;
      const row = Math.floor(index / photosPerRow);
      
      const x = 50 + col * (photoWidth + gap);
      const yPos = this.y + row * (photoHeight + gap + 30);
      
      // Check if we need a new page
      if (yPos + photoHeight > 750) {
        this.doc.addPage();
        this.y = 50;
        return;
      }
      
      // Draw photo border
      this.doc.rect(x, yPos, photoWidth, photoHeight).stroke('#E0E0E0');
      
      try {
        // Embed base64 image
        if (photo.photoUrl && photo.photoUrl.startsWith('data:image')) {
          const base64Data = photo.photoUrl.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          this.doc.image(buffer, x + 5, yPos + 5, {
            fit: [photoWidth - 10, photoHeight - 10],
            align: 'center',
            valign: 'center'
          });
        } else {
          // Placeholder text if image can't be loaded
          this.doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#999999')
            .text('[Fotoğraf]', x + 85, yPos + 75);
        }
      } catch (error) {
        // Error handling - show placeholder
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#999999')
          .text('[Fotoğraf yüklenemedi]', x + 60, yPos + 75);
      }
      
      // Caption
      if (photo.caption) {
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#000000')
          .text(photo.caption, x, yPos + photoHeight + 5, {
            width: photoWidth,
            align: 'center'
          });
      }
    });
    
    // Update y position for next section
    const totalRows = Math.ceil(photos.length / photosPerRow);
    this.y += totalRows * (photoHeight + gap + 30);
  }

  private addSignatures(inspection: InspectionData) {
    // New page for signatures
    this.doc.addPage();
    this.y = 50;
    
    // Section Title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('İmzalar', 50, this.y);
    
    this.y += 30;
    
    // Customer Signature
    if (inspection.customerSignature) {
      this.doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Müşteri İmzası', 50, this.y);
      
      this.y += 20;
      
      this.doc.rect(50, this.y, 220, 100).stroke('#E0E0E0');
      
      try {
        // Embed signature image (base64)
        if (inspection.customerSignature.startsWith('data:image')) {
          const base64Data = inspection.customerSignature.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          this.doc.image(buffer, 55, this.y + 5, {
            fit: [210, 90],
            align: 'center',
            valign: 'center'
          });
        }
      } catch (error) {
        // Fallback text
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#999999')
          .text('[İmza]', 130, this.y + 40);
      }
      
      this.y += 110;
      
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .text(inspection.customer?.name || '', 50, this.y)
        .text(
          new Date(inspection.inspectionDate).toLocaleDateString('tr-TR'),
          50,
          this.y + 15
        );
    }
    
    this.y = 130; // Reset for inspector signature
    
    // Inspector Signature
    if (inspection.inspectorSignature) {
      this.doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Kontrol Eden İmzası', 325, this.y);
      
      this.y += 20;
      
      this.doc.rect(325, this.y, 220, 100).stroke('#E0E0E0');
      
      try {
        // Embed signature image (base64)
        if (inspection.inspectorSignature.startsWith('data:image')) {
          const base64Data = inspection.inspectorSignature.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          this.doc.image(buffer, 330, this.y + 5, {
            fit: [210, 90],
            align: 'center',
            valign: 'center'
          });
        }
      } catch (error) {
        // Fallback text
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#999999')
          .text('[İmza]', 405, this.y + 40);
      }
      
      this.y += 110;
      
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .text(inspection.inspector?.name || '', 325, this.y)
        .text(
          new Date(inspection.inspectionDate).toLocaleDateString('tr-TR'),
          325,
          this.y + 15
        );
    }
  }

  private addFooter() {
    const pages = this.doc.bufferedPageRange();
    
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      
      // Footer line
      this.doc
        .moveTo(50, 780)
        .lineTo(545, 780)
        .stroke('#E0E0E0');
      
      // Footer text
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          'Bu rapor Canary Kamera Kiralama Sistemi tarafından oluşturulmuştur.',
          50,
          790,
          { align: 'center' }
        )
        .text(`Sayfa ${i + 1} / ${pages.count}`, 50, 805, {
          align: 'center',
        });
    }
  }

  private addHorizontalLine() {
    this.doc
      .moveTo(50, this.y)
      .lineTo(545, this.y)
      .stroke('#E0E0E0');
  }
}

export default InspectionPDFGenerator;
