import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface InvoiceWithDetails {
  id: number;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod?: string;
  notes?: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    identityNumber?: string;
    taxNumber?: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    equipment?: {
      name: string;
    };
  }>;
}

export class EArchiveService {
  /**
   * E-Arşiv fatura HTML şablonu oluştur
   * GİB standartlarına uygun HTML template
   */
  async generateHTML(invoiceId: number): Promise<string> {
    const invoice = await this.getInvoiceWithDetails(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Şirket bilgilerini .env'den al
    const companyName = process.env.COMPANY_NAME || 'Canary Digital';
    const companyAddress = process.env.COMPANY_ADDRESS || '';
    const companyCity = process.env.COMPANY_CITY || 'Istanbul';
    const companyTaxNumber = process.env.COMPANY_TAX_NUMBER || '';
    const companyTaxOffice = process.env.COMPANY_TAX_OFFICE || '';
    const companyPhone = process.env.COMPANY_PHONE || '';
    const companyEmail = process.env.COMPANY_EMAIL || '';

    // E-Arşiv ID oluştur
    const archiveId = `EA${Date.now()}`;

    // GİB standartlarına uygun HTML
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Arşiv Fatura - ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }
        .header h1 {
            font-size: 18pt;
            margin-bottom: 5px;
        }
        .header .archive-id {
            font-size: 12pt;
            color: #666;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-weight: bold;
            font-size: 11pt;
            background: #f0f0f0;
            padding: 5px;
            border-left: 3px solid #000;
            margin-bottom: 8px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-box {
            border: 1px solid #ccc;
            padding: 10px;
        }
        .info-row {
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 140px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table th, table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        table td.number {
            text-align: right;
        }
        .totals {
            margin-top: 15px;
            float: right;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
        }
        .total-row.grand {
            font-weight: bold;
            font-size: 12pt;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            margin-top: 5px;
        }
        .footer {
            clear: both;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            text-align: center;
            color: #666;
        }
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
        @media print {
            body {
                padding: 0;
            }
            .container {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>E-ARŞİV FATURA</h1>
            <div class="archive-id">Arşiv No: ${archiveId}</div>
        </div>

        <!-- FATURA BİLGİLERİ -->
        <div class="section">
            <div class="section-title">Fatura Bilgileri</div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Fatura No:</span>
                        <span>${invoice.invoiceNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Fatura Tarihi:</span>
                        <span>${this.formatDate(invoice.invoiceDate)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vade Tarihi:</span>
                        <span>${this.formatDate(invoice.dueDate)}</span>
                    </div>
                </div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Ödeme Yöntemi:</span>
                        <span>${invoice.paymentMethod || 'Nakit'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Para Birimi:</span>
                        <span>TRY</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- SATICI BİLGİLERİ -->
        <div class="section">
            <div class="section-title">Satıcı Bilgileri</div>
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Ünvan:</span>
                    <span>${companyName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Adres:</span>
                    <span>${companyAddress}, ${companyCity}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vergi Dairesi:</span>
                    <span>${companyTaxOffice}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vergi No:</span>
                    <span>${companyTaxNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span>${companyPhone}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">E-posta:</span>
                    <span>${companyEmail}</span>
                </div>
            </div>
        </div>

        <!-- ALICI BİLGİLERİ -->
        <div class="section">
            <div class="section-title">Alıcı Bilgileri</div>
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Ad Soyad/Ünvan:</span>
                    <span>${invoice.customer.name}</span>
                </div>
                ${invoice.customer.address ? `
                <div class="info-row">
                    <span class="info-label">Adres:</span>
                    <span>${invoice.customer.address}${invoice.customer.city ? ', ' + invoice.customer.city : ''}</span>
                </div>
                ` : ''}
                ${invoice.customer.identityNumber ? `
                <div class="info-row">
                    <span class="info-label">TC Kimlik No:</span>
                    <span>${invoice.customer.identityNumber}</span>
                </div>
                ` : ''}
                ${invoice.customer.taxNumber ? `
                <div class="info-row">
                    <span class="info-label">Vergi No:</span>
                    <span>${invoice.customer.taxNumber}</span>
                </div>
                ` : ''}
                ${invoice.customer.phone ? `
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span>${invoice.customer.phone}</span>
                </div>
                ` : ''}
                ${invoice.customer.email ? `
                <div class="info-row">
                    <span class="info-label">E-posta:</span>
                    <span>${invoice.customer.email}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- FATURA KALEMLERİ -->
        <div class="section">
            <div class="section-title">Fatura Kalemleri</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 40%;">Açıklama</th>
                        <th style="width: 10%;">Miktar</th>
                        <th style="width: 15%;">Birim Fiyat</th>
                        <th style="width: 10%;">KDV %</th>
                        <th style="width: 20%;">Toplam</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, index) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.equipment?.name || item.description}</td>
                        <td class="number">${item.quantity}</td>
                        <td class="number">${this.formatCurrency(item.unitPrice)}</td>
                        <td class="number">${item.vatRate}%</td>
                        <td class="number">${this.formatCurrency(lineTotal)}</td>
                    </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- TOPLAM TUTARLAR -->
        <div class="totals">
            <div class="total-row">
                <span>Ara Toplam:</span>
                <span>${this.formatCurrency(invoice.totalAmount)} TRY</span>
            </div>
            <div class="total-row">
                <span>KDV:</span>
                <span>${this.formatCurrency(invoice.vatAmount)} TRY</span>
            </div>
            <div class="total-row grand">
                <span>GENEL TOPLAM:</span>
                <span>${this.formatCurrency(invoice.grandTotal)} TRY</span>
            </div>
        </div>

        <!-- NOTLAR -->
        ${invoice.notes ? `
        <div class="section" style="clear: both; margin-top: 20px;">
            <div class="section-title">Notlar</div>
            <div class="info-box">
                ${invoice.notes}
            </div>
        </div>
        ` : ''}

        <!-- QR KOD ALANI -->
        <div class="qr-code">
            <p style="margin-bottom: 10px;">Bu e-arşiv faturayı aşağıdaki QR kod ile doğrulayabilirsiniz:</p>
            <div style="display: inline-block; border: 1px solid #ccc; padding: 10px;">
                [QR KOD ALANI - ${archiveId}]
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Bu belge elektronik ortamda oluşturulmuş ve GİB standartlarına uygun olarak arşivlenmiştir.</p>
            <p>Fatura Arşiv ID: ${archiveId} | Oluşturulma: ${this.formatDateTime(new Date())}</p>
        </div>
    </div>
</body>
</html>
    `;

    // E-Arşiv kaydını oluştur veya güncelle
    await prisma.eArchiveInvoice.upsert({
      where: { invoiceId },
      create: {
        invoiceId,
        archiveId,
        htmlContent: html,
        portalStatus: 'created'
      },
      update: {
        htmlContent: html,
        updatedAt: new Date()
      }
    });

    return html;
  }

  /**
   * E-Arşiv fatura PDF oluştur
   */
  async generatePDF(invoiceId: number): Promise<Buffer> {
    const invoice = await this.getInvoiceWithDetails(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Başlık
      doc.fontSize(20).text('E-ARŞİV FATURA', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Fatura No: ${invoice.invoiceNumber}`, { align: 'center' });
      doc.moveDown(1);

      // Fatura Bilgileri
      doc.fontSize(12).text('Fatura Bilgileri', { underline: true });
      doc.fontSize(10);
      doc.text(`Fatura Tarihi: ${this.formatDate(invoice.invoiceDate)}`);
      doc.text(`Vade Tarihi: ${this.formatDate(invoice.dueDate)}`);
      doc.text(`Ödeme Yöntemi: ${invoice.paymentMethod || 'Nakit'}`);
      doc.moveDown(1);

      // Müşteri Bilgileri
      doc.fontSize(12).text('Müşteri Bilgileri', { underline: true });
      doc.fontSize(10);
      doc.text(`Ad Soyad: ${invoice.customer.name}`);
      if (invoice.customer.address) doc.text(`Adres: ${invoice.customer.address}`);
      if (invoice.customer.phone) doc.text(`Telefon: ${invoice.customer.phone}`);
      if (invoice.customer.email) doc.text(`E-posta: ${invoice.customer.email}`);
      doc.moveDown(1);

      // Fatura Kalemleri
      doc.fontSize(12).text('Fatura Kalemleri', { underline: true });
      doc.moveDown(0.5);
      
      // Tablo başlıkları
      const tableTop = doc.y;
      doc.fontSize(9);
      doc.text('#', 50, tableTop, { width: 30 });
      doc.text('Açıklama', 80, tableTop, { width: 200 });
      doc.text('Miktar', 280, tableTop, { width: 50, align: 'right' });
      doc.text('Fiyat', 330, tableTop, { width: 70, align: 'right' });
      doc.text('KDV', 400, tableTop, { width: 50, align: 'right' });
      doc.text('Toplam', 450, tableTop, { width: 90, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();
      doc.moveDown(0.5);

      // Fatura kalemleri
      invoice.items.forEach((item, index) => {
        const y = doc.y;
        const lineTotal = item.quantity * item.unitPrice;
        
        doc.text((index + 1).toString(), 50, y, { width: 30 });
        doc.text(item.equipment?.name || item.description, 80, y, { width: 200 });
        doc.text(item.quantity.toString(), 280, y, { width: 50, align: 'right' });
        doc.text(this.formatCurrency(item.unitPrice), 330, y, { width: 70, align: 'right' });
        doc.text(`${item.vatRate}%`, 400, y, { width: 50, align: 'right' });
        doc.text(this.formatCurrency(lineTotal), 450, y, { width: 90, align: 'right' });
        
        doc.moveDown(0.5);
      });

      doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
      doc.moveDown(1);

      // Toplamlar
      const totalsX = 380;
      doc.fontSize(10);
      doc.text('Ara Toplam:', totalsX, doc.y, { width: 100 });
      doc.text(this.formatCurrency(invoice.totalAmount) + ' TRY', totalsX + 100, doc.y - 12, { width: 100, align: 'right' });
      
      doc.moveDown(0.3);
      doc.text('KDV:', totalsX, doc.y, { width: 100 });
      doc.text(this.formatCurrency(invoice.vatAmount) + ' TRY', totalsX + 100, doc.y - 12, { width: 100, align: 'right' });
      
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('GENEL TOPLAM:', totalsX, doc.y, { width: 100 });
      doc.text(this.formatCurrency(invoice.grandTotal) + ' TRY', totalsX + 100, doc.y - 14, { width: 100, align: 'right' });

      // Notlar
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica');
        doc.text('Notlar:', { underline: true });
        doc.text(invoice.notes);
      }

      // Footer
      doc.fontSize(8).text(
        'Bu belge elektronik ortamda oluşturulmuş ve GİB standartlarına uygun olarak arşivlenmiştir.',
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    });
  }

  /**
   * E-Arşiv fatura portal'a gönder (mock)
   */
  async sendToPortal(invoiceId: number): Promise<any> {
    const eArchive = await prisma.eArchiveInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eArchive) {
      throw new Error('E-Archive invoice not found. Generate HTML first.');
    }

    // TODO: Gerçek GİB portal entegrasyonu
    // Mock response
    const mockResponse = {
      status: 'sent',
      portalUrl: `https://earsivportal.efatura.gov.tr/view/${eArchive.archiveId}`,
      message: 'E-Arşiv fatura portal\'a gönderildi (TEST MODE)',
      sentDate: new Date()
    };

    // Durumu güncelle
    await prisma.eArchiveInvoice.update({
      where: { id: eArchive.id },
      data: {
        portalStatus: 'sent',
        pdfUrl: mockResponse.portalUrl,
        updatedAt: new Date()
      }
    });

    return mockResponse;
  }

  /**
   * E-Arşiv fatura durumu sorgula
   */
  async checkStatus(invoiceId: number): Promise<any> {
    const eArchive = await prisma.eArchiveInvoice.findUnique({
      where: { invoiceId },
      include: { invoice: true }
    });

    if (!eArchive) {
      throw new Error('E-Archive invoice not found');
    }

    return {
      archiveId: eArchive.archiveId,
      status: eArchive.portalStatus,
      pdfUrl: eArchive.pdfUrl,
      invoice: {
        number: eArchive.invoice.invoiceNumber,
        date: eArchive.invoice.invoiceDate,
        total: eArchive.invoice.grandTotal
      },
      createdAt: eArchive.createdAt,
      updatedAt: eArchive.updatedAt
    };
  }

  /**
   * Helper: Invoice with details
   */
  private async getInvoiceWithDetails(invoiceId: number): Promise<InvoiceWithDetails | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            taxNumber: true
          }
        },
        order: {
          include: {
            orderItems: {
              include: {
                equipment: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!invoice) return null;

    // Transform to InvoiceWithDetails format
    return {
      ...invoice,
      items: invoice.order?.orderItems || []
    } as any as InvoiceWithDetails;
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
}

export default new EArchiveService();
